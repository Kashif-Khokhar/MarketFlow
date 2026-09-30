import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../models/Order';
import { Cart } from '../models/Cart';
import { ProductVariant } from '../models/ProductVariant';
import { Store } from '../models/Store';
import { Notification, NotificationType } from '../models/Notification';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth.middleware';
import { Coupon, CouponType } from '../models/Coupon';
import { OrderStateMachine } from '../services/OrderStateMachine';

export const createOrder = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { shippingAddressId, couponCodes = [] } = req.body;

  const cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product', 'name')
    .populate('items.variant', 'sku price stock reservedStock');

  if (!cart || cart.items.length === 0) {
    return next(new AppError('Your cart is empty', 400));
  }

  // Get shipping address from user
  const address = req.user.addresses.find((a: any) => a._id.toString() === shippingAddressId);
  if (!address) {
    return next(new AppError('Shipping address not found', 404));
  }

  // Group items by store to create separate orders
  const itemsByStore: { [key: string]: any[] } = {};
  
  for (const item of cart.items) {
    const storeId = item.store.toString();
    if (!itemsByStore[storeId]) itemsByStore[storeId] = [];
    
    // Verify stock one last time
    const variant: any = item.variant;
    const availableStock = variant.stock - variant.reservedStock;
    if (availableStock < item.quantity) {
      return next(new AppError(`Insufficient stock for ${item.product.name}`, 400));
    }

    itemsByStore[storeId].push(item);
  }

  const checkoutGroupId = crypto.randomUUID();
  const successfullyReserved: { variantId: string, quantity: number }[] = [];

  try {
    const createdOrders = [];

    // First pass: Atomically reserve all inventory across all stores
    for (const storeId of Object.keys(itemsByStore)) {
      const storeItems = itemsByStore[storeId];
      
      for (const item of storeItems) {
        const variantId = item.variant._id;
        const quantity = item.quantity;
        
        // Atomically ensure stock - reservedStock >= quantity
        const updatedVariant = await ProductVariant.findOneAndUpdate(
          {
            _id: variantId,
            $expr: { $gte: [{ $subtract: ['$stock', '$reservedStock'] }, quantity] }
          },
          { $inc: { reservedStock: quantity } },
          { new: true }
        );

        if (!updatedVariant) {
          throw new AppError(`Insufficient stock for ${item.product.name}`, 400);
        }

        successfullyReserved.push({ variantId, quantity });
      }
    }

    // Fetch valid coupons
    const validCoupons = await Coupon.find({ code: { $in: couponCodes }, isActive: true });

    // Second pass: Create the orders
    for (const storeId of Object.keys(itemsByStore)) {
      const storeItems = itemsByStore[storeId];
      let subtotal = 0;
      
      const orderItems = [];

      for (const item of storeItems) {
        // ALWAYS use the server's price, never the frontend's
        const variant = await ProductVariant.findById(item.variant._id);
        if (!variant) throw new AppError('Variant not found during order creation', 404);
        
        subtotal += variant.price * item.quantity;
        
        orderItems.push({
          product: item.product._id,
          variant: variant._id,
          name: item.product.name,
          sku: variant.sku,
          price: variant.price,
          quantity: item.quantity
        });
      }

      // Calculate discount
      let discountAmount = 0;
      let appliedCouponId = undefined;
      const storeCoupon = validCoupons.find(c => (!c.store || c.store.toString() === storeId));
      
      if (storeCoupon) {
        const now = new Date();
        if (now >= storeCoupon.startDate && now <= storeCoupon.endDate && storeCoupon.usedCount < storeCoupon.usageLimit) {
          if (subtotal >= storeCoupon.minPurchaseAmount) {
            if (storeCoupon.type === CouponType.FIXED) {
              discountAmount = storeCoupon.discountValue;
            } else if (storeCoupon.type === CouponType.PERCENTAGE) {
              discountAmount = (subtotal * storeCoupon.discountValue) / 100;
              if (storeCoupon.maxDiscountAmount && discountAmount > storeCoupon.maxDiscountAmount) {
                discountAmount = storeCoupon.maxDiscountAmount;
              }
            }
            discountAmount = Math.min(discountAmount, subtotal);
            appliedCouponId = storeCoupon._id;
            
            // Increment usage count
            storeCoupon.usedCount += 1;
            await storeCoupon.save();
          }
        }
      }

      // Calculate simple flat shipping fee for demo (backend controlled)
      const shippingFee = (subtotal - discountAmount) > 100 ? 0 : 10;
      const totalAmount = subtotal - discountAmount + shippingFee;

      const order = await Order.create([{
        checkoutGroupId,
        customer: req.user._id,
        store: storeId,
        items: orderItems,
        subtotal,
        shippingFee,
        discountAmount,
        appliedCoupon: appliedCouponId,
        totalAmount,
        shippingAddress: {
          street: address.street,
          city: address.city,
          state: address.state,
          country: address.country,
          zipCode: address.zipCode,
        }
      }]);

      createdOrders.push(order[0]);

      // Notify seller
      const storeDoc = await Store.findById(storeId);
      if (storeDoc) {
        await Notification.create({
          user: storeDoc.owner,
          type: NotificationType.ORDER_STATUS,
          title: 'New Order Received',
          message: `You have received a new order for ${orderItems.length} item(s).`,
          link: '/seller/orders'
        });
      }
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, data: { orders: createdOrders } });

  } catch (error) {
    // Rollback reserved stock
    for (const res of successfullyReserved) {
      await ProductVariant.findByIdAndUpdate(
        res.variantId,
        { $inc: { reservedStock: -res.quantity } }
      );
    }
    console.error("Order Creation Error:", error);
    if (error instanceof AppError) return next(error);
    return next(new AppError('Failed to create order.', 500));
  }
});

export const getMyOrders = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const orders = await Order.find({ customer: req.user._id })
    .populate('store', 'name logoUrl')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Order.countDocuments({ customer: req.user._id });

  res.status(200).json({ 
    success: true, 
    data: { 
      orders,
      pagination: { total, page, pages: Math.ceil(total / limit) }
    } 
  });
});

export const getSellerOrders = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const store = await Store.findOne({ owner: req.user._id });
  if (!store) return next(new AppError('Store not found', 404));

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const orders = await Order.find({ store: store._id })
    .populate('customer', 'name email')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Order.countDocuments({ store: store._id });

  res.status(200).json({ 
    success: true, 
    data: { 
      orders,
      pagination: { total, page, pages: Math.ceil(total / limit) }
    } 
  });
});

export const updateOrderStatus = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { status, trackingNumber } = req.body;

  const store = await Store.findOne({ owner: req.user._id });
  if (!store) return next(new AppError('Store not found', 404));

  const order = await Order.findOne({ _id: id, store: store._id });
  if (!order) return next(new AppError('Order not found', 404));

  // Validate state transition
  OrderStateMachine.assertTransition(order.status as OrderStatus, status as OrderStatus);

  if (status === OrderStatus.CANCELLED) {
    try {
      for (const item of order.items) {
        await ProductVariant.findByIdAndUpdate(
          item.variant,
          { $inc: { reservedStock: -item.quantity } }
        );
      }
      order.status = status;
      await order.save();
    } catch (error) {
      console.error("Cancel Order Error:", error);
      return next(new AppError('Failed to cancel order', 500));
    }
  } else if (status === OrderStatus.DELIVERED) {
    // Commit stock reduction
    try {
      for (const item of order.items) {
        await ProductVariant.findByIdAndUpdate(
          item.variant,
          { $inc: { stock: -item.quantity, reservedStock: -item.quantity } }
        );
      }
      order.status = status;
      if (trackingNumber) order.trackingNumber = trackingNumber;
      await order.save();
    } catch (error) {
      console.error("Update Order Error:", error);
      return next(new AppError('Failed to update order', 500));
    }
  } else {
    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    await order.save();
  }

  let notificationTitle = `Order Status Updated`;
  let notificationMessage = `Your order status is now ${status}.`;

  if (status === OrderStatus.PROCESSING) {
    notificationTitle = `Order Confirmed`;
    notificationMessage = `Your order has been confirmed by the seller and is now processing.`;
  } else if (status === OrderStatus.CANCELLED) {
    notificationTitle = `Order Declined`;
    notificationMessage = `Unfortunately, your order has been declined by the seller and cancelled.`;
  } else if (status === OrderStatus.SHIPPED) {
    notificationTitle = `Order Shipped`;
    notificationMessage = `Your order has been shipped.`;
  } else if (status === OrderStatus.OUT_FOR_DELIVERY) {
    notificationTitle = `Order Out for Delivery`;
    notificationMessage = `Your order is out for delivery.`;
  } else if (status === OrderStatus.DELIVERED) {
    notificationTitle = `Order Delivered`;
    notificationMessage = `Your order has been delivered.`;
  }

  // Notify customer
  await Notification.create({
    user: order.customer,
    type: NotificationType.ORDER_STATUS,
    title: notificationTitle,
    message: notificationMessage,
    link: '/orders'
  });

  res.status(200).json({ success: true, data: { order } });
});

export const requestReturn = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { reason } = req.body;

  const order = await Order.findOne({ _id: id, customer: req.user._id });
  if (!order) return next(new AppError('Order not found', 404));

  OrderStateMachine.assertTransition(order.status as OrderStatus, OrderStatus.RETURN_REQUESTED);

  order.status = OrderStatus.RETURN_REQUESTED;
  order.returnReason = reason;
  await order.save();

  // Notify seller
  const store = await Store.findById(order.store);
  if (store) {
    await Notification.create({
      user: store.owner,
      type: NotificationType.ORDER_STATUS,
      title: 'Return Requested',
      message: `A customer has requested a return for order ${order._id}.`,
      link: '/seller/orders'
    });
  }

  res.status(200).json({ success: true, data: { order } });
});

export const processReturn = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { action, refundAmount } = req.body; // action: 'approve' or 'reject'

  const store = await Store.findOne({ owner: req.user._id });
  if (!store) return next(new AppError('Store not found', 404));

  const order = await Order.findOne({ _id: id, store: store._id });
  if (!order) return next(new AppError('Order not found', 404));

  if (action === 'approve') {
    OrderStateMachine.assertTransition(order.status as OrderStatus, OrderStatus.RETURN_APPROVED);
    order.status = OrderStatus.RETURN_APPROVED;
    order.refundAmount = refundAmount || order.totalAmount;
    await order.save();

    // In a real flow, you might trigger the refund here or in a background job
    OrderStateMachine.assertTransition(order.status as OrderStatus, OrderStatus.REFUNDING);
    order.status = OrderStatus.REFUNDING;
    await order.save();

    const { paymentService } = require('../services/PaymentService');
    try {
      if (order.paymentIntentId) {
        await paymentService.processRefund(order.paymentIntentId, order.refundAmount);
      }
      
      order.status = OrderStatus.REFUNDED;
      await order.save();

      // Restore inventory
      for (const item of order.items) {
        await ProductVariant.findByIdAndUpdate(
          item.variant,
          { $inc: { stock: item.quantity, reservedStock: item.quantity } }
        );
      }
    } catch (err) {
      console.error("Refund Error:", err);
      return next(new AppError('Failed to process refund', 500));
    }
  } else if (action === 'reject') {
    OrderStateMachine.assertTransition(order.status as OrderStatus, OrderStatus.RETURN_REJECTED);
    order.status = OrderStatus.RETURN_REJECTED;
    await order.save();
  } else {
    return next(new AppError('Invalid action', 400));
  }

  // Notify customer
  await Notification.create({
    user: order.customer,
    type: NotificationType.ORDER_STATUS,
    title: `Return ${action === 'approve' ? 'Approved' : 'Rejected'}`,
    message: `Your return request for order ${order._id} has been ${action}d.`,
    link: '/orders'
  });

  res.status(200).json({ success: true, data: { order } });
});
