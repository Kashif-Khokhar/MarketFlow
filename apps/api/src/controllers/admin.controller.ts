import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Store } from '../models/Store';
import { Product } from '../models/Product';
import { Order, OrderStatus } from '../models/Order';
import { AuditLog } from '../models/AuditLog';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Basic pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const users = await User.find().skip(skip).limit(limit).sort('-createdAt');
  const total = await User.countDocuments();

  res.status(200).json({ 
    success: true, 
    data: { 
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    } 
  });
});

export const suspendUser = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.isActive = false;
  await user.save();

  await AuditLog.create({
    admin: req.user._id,
    action: 'SUSPEND_USER',
    targetId: id
  });

  // Optionally revoke all tokens here via Redis

  res.status(200).json({ success: true, message: 'User suspended successfully' });
});

export const reactivateUser = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.isActive = true;
  await user.save();

  await AuditLog.create({
    admin: req.user._id,
    action: 'REACTIVATE_USER',
    targetId: id
  });

  res.status(200).json({ success: true, message: 'User reactivated successfully' });
});

export const getAllStores = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const stores = await Store.find().populate('owner', 'name email').skip(skip).limit(limit).sort('-createdAt');
  const total = await Store.countDocuments();

  res.status(200).json({
    success: true,
    data: {
      stores,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

export const getStoreProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  const products = await Product.find({ store: id }).populate('category', 'name').skip(skip).limit(limit).sort('-createdAt');
  const total = await Product.countDocuments({ store: id });

  res.status(200).json({
    success: true,
    data: {
      products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

export const getAllOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const orders = await Order.find()
    .populate('customer', 'name email')
    .populate('store', 'name')
    .skip(skip)
    .limit(limit)
    .sort('-createdAt');
    
  const total = await Order.countDocuments();

  res.status(200).json({
    success: true,
    data: {
      orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

export const overrideOrderStatus = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { status, refundAmount } = req.body;

  const order = await Order.findById(id);
  if (!order) return next(new AppError('Order not found', 404));

  const oldStatus = order.status;
  order.status = status;
  
  if (status === OrderStatus.REFUNDED || status === OrderStatus.RETURN_APPROVED) {
    if (refundAmount) {
      order.refundAmount = refundAmount;
    }
  }

  await order.save();

  await AuditLog.create({
    admin: req.user._id,
    action: 'OVERRIDE_ORDER_STATUS',
    targetId: id,
    details: {
      oldStatus,
      newStatus: status
    }
  });

  res.status(200).json({ success: true, data: { order } });
});
