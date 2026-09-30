import { Request, Response, NextFunction } from 'express';
import { Store, StoreStatus } from '../models/Store';
import { Product } from '../models/Product';
import { User, UserRole } from '../models/User';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth.middleware';
import { storageService } from '../services/StorageService';

export const createStore = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, description, logoUrl } = req.body;

  const existingStore = await Store.findOne({ owner: req.user._id });
  if (existingStore) {
    return next(new AppError('You already have a store', 400));
  }

  const existingName = await Store.findOne({ name });
  if (existingName) {
    return next(new AppError('Store name already taken', 400));
  }

  const store = await Store.create({
    owner: req.user._id,
    name,
    description,
    logoUrl,
  });

  await User.findByIdAndUpdate(req.user._id, { role: UserRole.SELLER });

  res.status(201).json({ success: true, data: { store } });
});

export const uploadLogo = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new AppError('Please upload an image file', 400));
  }

  const store = await Store.findOne({ owner: req.user._id });
  if (!store) {
    return next(new AppError('Store not found', 404));
  }

  const logoUrl = await storageService.upload(
    req.file.buffer,
    req.file.mimetype,
    req.file.originalname
  );

  store.logoUrl = logoUrl;
  await store.save();

  res.status(200).json({ success: true, data: { store } });
});

export const getStore = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const store = await Store.findOne({ owner: req.user._id });
  
  if (!store) {
    return next(new AppError('Store not found', 404));
  }

  res.status(200).json({ success: true, data: { store } });
});

export const updateStore = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, description, logoUrl } = req.body;

  const store = await Store.findOne({ owner: req.user._id });
  if (!store) {
    return next(new AppError('Store not found', 404));
  }

  if (name && name !== store.name) {
    const existingName = await Store.findOne({ name });
    if (existingName) return next(new AppError('Store name already taken', 400));
    store.name = name;
  }

  if (description) store.description = description;
  if (logoUrl) store.logoUrl = logoUrl;

  await store.save();

  res.status(200).json({ success: true, data: { store } });
});

export const getStoreProducts = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const store = await Store.findOne({ owner: req.user._id });
  if (!store) return next(new AppError('Store not found', 404));

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const products = await Product.find({ store: store._id })
    .skip((page - 1) * limit)
    .limit(limit)
    .sort('-createdAt');

  const total = await Product.countDocuments({ store: store._id });

  res.status(200).json({ 
    success: true, 
    data: { 
      products,
      pagination: { total, page, pages: Math.ceil(total / limit) }
    } 
  });
});

export const getPublicStores = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const stores = await Store.find({ status: StoreStatus.ACTIVE })
    .sort('-rating -totalReviews')
    .limit(10);

  res.status(200).json({ success: true, data: { stores } });
});
