import { Request, Response, NextFunction } from 'express';
import { Review } from '../models/Review';
import { Order } from '../models/Order';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth.middleware';

export const createReview = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { productId, storeId, rating, title, comment, images } = req.body;

  // Check if they already reviewed it
  const filter: any = { user: req.user._id };
  if (productId) filter.product = productId;
  if (storeId) filter.store = storeId;

  const existingReview = await Review.findOne(filter);
  if (existingReview) {
    return next(new AppError('You have already reviewed this item', 400));
  }

  // Check if verified purchase
  let isVerifiedPurchase = false;
  if (productId) {
    const order = await Order.findOne({
      customer: req.user._id,
      'items.product': productId,
      status: { $in: ['DELIVERED'] }
    });
    if (order) isVerifiedPurchase = true;
  } else if (storeId) {
    const order = await Order.findOne({
      customer: req.user._id,
      store: storeId,
      status: { $in: ['DELIVERED'] }
    });
    if (order) isVerifiedPurchase = true;
  }

  if (!isVerifiedPurchase) {
    return next(new AppError('You can only review products or stores after your order has been delivered.', 403));
  }

  const review = await Review.create({
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

export const getReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { productId, storeId } = req.query;

  const filter: any = {};
  if (productId) filter.product = productId;
  if (storeId) filter.store = storeId;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const reviews = await Review.find(filter)
    .populate('user', 'name avatar')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Review.countDocuments(filter);

  res.status(200).json({ 
    success: true, 
    data: { 
      reviews,
      pagination: { total, page, pages: Math.ceil(total / limit) }
    } 
  });
});

export const deleteReview = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const review = await Review.findOneAndDelete({ _id: id, user: req.user._id });
  
  if (!review) {
    return next(new AppError('Review not found or unauthorized', 404));
  }

  res.status(200).json({ success: true, message: 'Review deleted successfully' });
});
