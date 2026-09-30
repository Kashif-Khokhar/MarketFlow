import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from '../models/User';
import { Store, StoreStatus } from '../models/Store';
import { Product } from '../models/Product';
import { ProductVariant } from '../models/ProductVariant';
import { Order, OrderStatus } from '../models/Order';
import { Review } from '../models/Review';
import { Notification } from '../models/Notification';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAdminStats = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const [
    totalUsers,
    totalSellers,
    pendingStores,
    activeStores,
    totalOrders,
    totalRevenueAgg
  ] = await Promise.all([
    User.countDocuments({ role: UserRole.CUSTOMER }),
    User.countDocuments({ role: UserRole.SELLER }),
    Store.countDocuments({ status: StoreStatus.PENDING }),
    Store.countDocuments({ status: StoreStatus.ACTIVE }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: { $in: [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ])
  ]);

  const totalRevenue = totalRevenueAgg[0]?.total || 0;

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalSellers,
      pendingStores,
      activeStores,
      totalOrders,
      totalRevenue
    }
  });
});

export const getSellerStats = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const store = await Store.findOne({ owner: req.user._id });
  if (!store) return next(new AppError('Store not found', 404));

  const [
    totalProducts,
    totalOrders,
    pendingOrders,
    totalRevenueAgg,
    recentOrders,
    lowStockVariants
  ] = await Promise.all([
    Product.countDocuments({ store: store._id }),
    Order.countDocuments({ store: store._id }),
    Order.countDocuments({ store: store._id, status: OrderStatus.PENDING }),
    Order.aggregate([
      { $match: { store: store._id, status: { $in: [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Order.find({ store: store._id }).sort('-createdAt').limit(5).populate('customer', 'name'),
    // Find variants where stock - reservedStock < 10.
    // Since we can't easily query derived values directly in mongoose find without aggregation,
    // we use an aggregation pipeline to filter low stock variants for the seller's products.
    ProductVariant.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      { $match: { 'productInfo.store': store._id } },
      {
        $project: {
          sku: 1,
          price: 1,
          stock: 1,
          reservedStock: 1,
          productName: '$productInfo.name',
          availableStock: { $subtract: ['$stock', '$reservedStock'] }
        }
      },
      { $match: { availableStock: { $lt: 10 } } },
      { $limit: 10 }
    ])
  ]);

  const totalRevenue = totalRevenueAgg[0]?.total || 0;

  res.status(200).json({
    success: true,
    data: {
      store: {
        name: store.name,
        rating: store.rating,
        totalReviews: store.totalReviews,
      },
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
      recentOrders,
      lowStockVariants
    }
  });
});

export const getCustomerStats = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const [
    totalOrders,
    recentOrders,
    unreadNotifications,
    totalReviews
  ] = await Promise.all([
    Order.countDocuments({ customer: req.user._id }),
    Order.find({ customer: req.user._id }).sort('-createdAt').limit(5).populate('store', 'name'),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
    Review.countDocuments({ user: req.user._id })
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalOrders,
      recentOrders,
      unreadNotifications,
      totalReviews
    }
  });
});
