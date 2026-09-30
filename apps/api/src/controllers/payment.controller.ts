import { Request, Response, NextFunction } from 'express';
import { Order, OrderStatus } from '../models/Order';
import { paymentService } from '../services/PaymentService';
import { ProcessedWebhook } from '../models/ProcessedWebhook';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth.middleware';

export const createPaymentIntent = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { orderIds } = req.body;

  const orders = await Order.find({
    _id: { $in: orderIds },
    customer: req.user._id,
    status: OrderStatus.PENDING
  });

  if (!orders || orders.length === 0) {
    return next(new AppError('No pending orders found to pay', 404));
  }

  // Calculate total amount to charge
  const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  // In real life, convert totalAmount to cents for Stripe: totalAmount * 100
  const paymentIntent = await paymentService.createPaymentIntent(totalAmount, 'usd', {
    orderIds: orderIds.join(','),
    customerId: req.user._id.toString()
  });

  // Save payment intent to orders
  for (const order of orders) {
    order.paymentIntentId = paymentIntent.id;
    await order.save();
  }

  res.status(200).json({ 
    success: true, 
    data: { 
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.id 
    } 
  });
});

export const webhook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const sig = req.headers['stripe-signature'] as string || 'mock-sig';
  
  // Verify signature
  if (!paymentService.verifyWebhookSignature(req.body, sig)) {
    return next(new AppError('Webhook signature verification failed', 400));
  }

  // Idempotency: Check if we already processed this event
  const eventId = req.body.id || `mock_event_${Date.now()}`;
  
  try {
    const existingWebhook = await ProcessedWebhook.findOne({ eventId });
    if (existingWebhook) {
      console.log(`[Webhook] Event ${eventId} already processed.`);
      return res.status(200).json({ received: true });
    }
  } catch (err) {
    // ignore
  }

  const { type, data } = req.body;

  if (type === 'payment_intent.succeeded') {
    const paymentIntentId = data.object.id;
    
    // Find orders and update to PAID
    await Order.updateMany(
      { paymentIntentId, status: OrderStatus.PENDING },
      { $set: { status: OrderStatus.PAID } }
    );
    
    console.log(`[Webhook] Payment ${paymentIntentId} succeeded. Orders updated to PAID.`);
  }

  // Record webhook as processed
  try {
    await ProcessedWebhook.create({ eventId });
  } catch (err) {
    console.error('Failed to save ProcessedWebhook', err);
  }

  res.status(200).json({ received: true });
});
