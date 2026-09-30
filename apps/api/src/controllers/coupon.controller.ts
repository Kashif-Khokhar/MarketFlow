import { Request, Response, NextFunction } from 'express';
import { Coupon, CouponType } from '../models/Coupon';
import { Store } from '../models/Store';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth.middleware';

export const createCoupon = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { code, type, discountValue, minPurchaseAmount, maxDiscountAmount, startDate, endDate, usageLimit } = req.body;
  
  // Find if user has a store
  const store = await Store.findOne({ owner: req.user._id });
  if (!store && req.user.role !== 'ADMIN') {
    return next(new AppError('Only store owners or admins can create coupons', 403));
  }

  const existing = await Coupon.findOne({ code });
  if (existing) {
    return next(new AppError('Coupon code already exists', 400));
  }

  const coupon = await Coupon.create({
    code,
    store: store ? store._id : null,
    type,
    discountValue,
    minPurchaseAmount,
    maxDiscountAmount,
    startDate,
    endDate,
    usageLimit
  });

  res.status(201).json({ success: true, data: { coupon } });
});

export const getStoreCoupons = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const store = await Store.findOne({ owner: req.user._id });
  if (!store) {
    return next(new AppError('Store not found', 404));
  }

  const coupons = await Coupon.find({ store: store._id }).sort('-createdAt');
  res.status(200).json({ success: true, data: { coupons } });
});

export const applyCoupon = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { code, storeId, subtotal } = req.body; // Subtotal of the specific store's items

  const coupon = await Coupon.findOne({ code, isActive: true });
  if (!coupon) return next(new AppError('Invalid or expired coupon', 404));

  // Check store constraint
  if (coupon.store && coupon.store.toString() !== storeId) {
    return next(new AppError('This coupon is not valid for this store', 400));
  }

  const now = new Date();
  if (now < coupon.startDate || now > coupon.endDate) {
    return next(new AppError('This coupon is not currently valid', 400));
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    return next(new AppError('Coupon usage limit reached', 400));
  }

  if (subtotal < coupon.minPurchaseAmount) {
    return next(new AppError(`Minimum purchase amount is ${coupon.minPurchaseAmount}`, 400));
  }

  let discount = 0;
  if (coupon.type === CouponType.FIXED) {
    discount = coupon.discountValue;
  } else if (coupon.type === CouponType.PERCENTAGE) {
    discount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  }

  // Cap discount at subtotal
  discount = Math.min(discount, subtotal);

  res.status(200).json({ 
    success: true, 
    data: { 
      discount,
      couponId: coupon._id
    } 
  });
});
