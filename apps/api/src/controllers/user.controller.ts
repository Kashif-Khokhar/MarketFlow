import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth.middleware';
import { storageService } from '../services/StorageService';

export const getProfile = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, data: { user } });
});

export const updateProfile = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, phone, bio } = req.body;
  
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, bio },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, data: { user: updatedUser } });
});

export const addAddress = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { street, city, state, country, zipCode, isDefault } = req.body;
  
  const user = await User.findById(req.user._id);
  if (!user) return next(new AppError('User not found', 404));

  if (isDefault) {
    user.addresses.forEach((addr: any) => addr.isDefault = false);
  }

  user.addresses.push({ street, city, state, country, zipCode, isDefault });
  await user.save();

  res.status(200).json({ success: true, data: { addresses: user.addresses } });
});

export const deleteAddress = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { addressId } = req.params;

  const user = await User.findById(req.user._id);
  if (!user) return next(new AppError('User not found', 404));

  user.addresses = user.addresses.filter((addr: any) => addr._id?.toString() !== addressId);
  await user.save();

  res.status(200).json({ success: true, data: { addresses: user.addresses } });
});

export const uploadAvatar = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new AppError('Please upload an image file', 400));
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Pass memory buffer to StorageService
  const avatarUrl = await storageService.upload(
    req.file.buffer,
    req.file.mimetype,
    req.file.originalname
  );

  user.avatar = avatarUrl;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: {
      avatar: user.avatar
    }
  });
});
