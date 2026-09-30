import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models/Notification';
import { catchAsync } from '../utils/catchAsync';
import { AuthRequest } from '../middleware/auth.middleware';

export const getNotifications = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const notifications = await Notification.find({ user: req.user._id })
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit);

  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

  res.status(200).json({ 
    success: true, 
    data: { 
      notifications,
      unreadCount,
      pagination: { page, limit }
    } 
  });
});

export const markAsRead = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  await Notification.findOneAndUpdate(
    { _id: id, user: req.user._id },
    { isRead: true }
  );

  res.status(200).json({ success: true, message: 'Notification marked as read' });
});

export const markAllAsRead = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true }
  );

  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});
