"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.getReviews = exports.createReview = void 0;
const Review_1 = require("../models/Review");
const Order_1 = require("../models/Order");
const catchAsync_1 = require("../utils/catchAsync");
const AppError_1 = require("../utils/AppError");
exports.createReview = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { productId, storeId, rating, title, comment, images } = req.body;
    // Check if they already reviewed it
    const filter = { user: req.user._id };
    if (productId)
        filter.product = productId;
    if (storeId)
        filter.store = storeId;
    const existingReview = await Review_1.Review.findOne(filter);
    if (existingReview) {
        return next(new AppError_1.AppError('You have already reviewed this item', 400));
    }
    // Check if verified purchase
    let isVerifiedPurchase = false;
    if (productId) {
        const order = await Order_1.Order.findOne({
            customer: req.user._id,
            'items.product': productId,
            status: { $in: ['DELIVERED'] }
        });
        if (order)
            isVerifiedPurchase = true;
    }
    else if (storeId) {
        const order = await Order_1.Order.findOne({
            customer: req.user._id,
            store: storeId,
            status: { $in: ['DELIVERED'] }
        });
        if (order)
            isVerifiedPurchase = true;
    }
    if (!isVerifiedPurchase) {
        return next(new AppError_1.AppError('You can only review products or stores after your order has been delivered.', 403));
    }
    const review = await Review_1.Review.create({
        user: req.user._id,
        product: productId,
        store: storeId,
        rating,
        title,
        comment,
        images,
        isVerifiedPurchase
    });
    res.status(201).json({ success: true, data: { review } });
});
exports.getReviews = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { productId, storeId } = req.query;
    const filter = {};
    if (productId)
        filter.product = productId;
    if (storeId)
        filter.store = storeId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const reviews = await Review_1.Review.find(filter)
        .populate('user', 'name avatar')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit);
    const total = await Review_1.Review.countDocuments(filter);
    res.status(200).json({
        success: true,
        data: {
            reviews,
            pagination: { total, page, pages: Math.ceil(total / limit) }
        }
    });
});
exports.deleteReview = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { id } = req.params;
    const review = await Review_1.Review.findOneAndDelete({ _id: id, user: req.user._id });
    if (!review) {
        return next(new AppError_1.AppError('Review not found or unauthorized', 404));
    }
    res.status(200).json({ success: true, message: 'Review deleted successfully' });
});
