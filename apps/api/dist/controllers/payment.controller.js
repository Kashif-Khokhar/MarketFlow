"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhook = exports.createPaymentIntent = void 0;
const Order_1 = require("../models/Order");
const PaymentService_1 = require("../services/PaymentService");
const ProcessedWebhook_1 = require("../models/ProcessedWebhook");
const catchAsync_1 = require("../utils/catchAsync");
const AppError_1 = require("../utils/AppError");
exports.createPaymentIntent = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { orderIds } = req.body;
    const orders = await Order_1.Order.find({
        _id: { $in: orderIds },
        customer: req.user._id,
        status: Order_1.OrderStatus.PENDING
    });
    if (!orders || orders.length === 0) {
        return next(new AppError_1.AppError('No pending orders found to pay', 404));
    }
    // Calculate total amount to charge
    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    // In real life, convert totalAmount to cents for Stripe: totalAmount * 100
    const paymentIntent = await PaymentService_1.paymentService.createPaymentIntent(totalAmount, 'usd', {
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
exports.webhook = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const sig = req.headers['stripe-signature'] || 'mock-sig';
    // Verify signature
    if (!PaymentService_1.paymentService.verifyWebhookSignature(req.body, sig)) {
        return next(new AppError_1.AppError('Webhook signature verification failed', 400));
    }
    // Idempotency: Check if we already processed this event
    const eventId = req.body.id || `mock_event_${Date.now()}`;
    try {
        const existingWebhook = await ProcessedWebhook_1.ProcessedWebhook.findOne({ eventId });
        if (existingWebhook) {
            console.log(`[Webhook] Event ${eventId} already processed.`);
            return res.status(200).json({ received: true });
        }
    }
    catch (err) {
        // ignore
    }
    const { type, data } = req.body;
    if (type === 'payment_intent.succeeded') {
        const paymentIntentId = data.object.id;
        // Find orders and update to PAID
        await Order_1.Order.updateMany({ paymentIntentId, status: Order_1.OrderStatus.PENDING }, { $set: { status: Order_1.OrderStatus.PAID } });
        console.log(`[Webhook] Payment ${paymentIntentId} succeeded. Orders updated to PAID.`);
    }
    // Record webhook as processed
    try {
        await ProcessedWebhook_1.ProcessedWebhook.create({ eventId });
    }
    catch (err) {
        console.error('Failed to save ProcessedWebhook', err);
    }
    res.status(200).json({ received: true });
});
