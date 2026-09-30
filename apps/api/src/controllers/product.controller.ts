import { Request, Response, NextFunction } from 'express';
import slugify from 'slugify';
import { Product } from '../models/Product';
import { ProductVariant } from '../models/ProductVariant';
import { Store } from '../models/Store';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth.middleware';
import { storageService } from '../services/StorageService';

export const createProduct = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const store = await Store.findOne({ owner: req.user._id });
  if (!store) return next(new AppError('Store not found', 404));

  const { name, description, basePrice, category, attributes, images, variants } = req.body;

  const slug = slugify(name, { lower: true, strict: true }) + '-' + Date.now();

  const product = await Product.create({
    store: store._id,
    category,
    name,
    slug,
    description,
    basePrice,
    attributes,
    images
  });

  // Create variants
  if (variants && variants.length > 0) {
    const variantDocs = variants.map((v: any) => ({
      ...v,
      product: product._id
    }));
    await ProductVariant.insertMany(variantDocs);
  }

  res.status(201).json({ success: true, data: { product } });
});

export const getProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  
  // Basic filtering
  const filter: any = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.store) filter.store = req.query.store;
  if (req.query.search) {
    filter.$text = { $search: req.query.search as string };
  }

  const products = await Product.find(filter)
    .populate('store', 'name logoUrl')
    .populate('category', 'name slug')
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(req.query.search ? { score: { $meta: 'textScore' } } : '-createdAt');

  const total = await Product.countDocuments(filter);

  res.status(200).json({ 
    success: true, 
    data: { 
      products,
      pagination: { total, page, pages: Math.ceil(total / limit) }
    } 
  });
});

export const getProductBySlug = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { slug } = req.params;

  const product = await Product.findOne({ slug })
    .populate('store', 'name logoUrl')
    .populate('category', 'name slug');

  if (!product) return next(new AppError('Product not found', 404));

  const variants = await ProductVariant.find({ product: product._id, isActive: true });

  res.status(200).json({ success: true, data: { product, variants } });
});

export const uploadProductImages = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) return next(new AppError('Product not found', 404));

  const store = await Store.findOne({ owner: req.user._id });
  if (!store || product.store.toString() !== store._id.toString()) {
    return next(new AppError('Not authorized to update this product', 403));
  }

  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return next(new AppError('Please upload at least one image', 400));
  }

  const imageUrls = await Promise.all(files.map(async (file) => {
    return await storageService.upload(file.buffer, file.mimetype, file.originalname);
  }));

  product.images.push(...imageUrls);
  await product.save();

  res.status(200).json({ success: true, data: { product } });
});

export const updateProduct = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) return next(new AppError('Product not found', 404));

  const store = await Store.findOne({ owner: req.user._id });
  if (!store || product.store.toString() !== store._id.toString()) {
    return next(new AppError('Not authorized to update this product', 403));
  }

  const { variants, ...updateData } = req.body;

  if (updateData.name && updateData.name !== product.name) {
    updateData.slug = slugify(updateData.name, { lower: true, strict: true }) + '-' + Date.now();
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

  if (variants && variants.length > 0) {
    await ProductVariant.deleteMany({ product: id });
    const variantDocs = variants.map((v: any) => ({
      ...v,
      product: id
    }));
    await ProductVariant.insertMany(variantDocs);
  }

  const updatedVariants = await ProductVariant.find({ product: id });

  res.status(200).json({ success: true, data: { product: updatedProduct, variants: updatedVariants } });
});

export const deleteProduct = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) return next(new AppError('Product not found', 404));

  const store = await Store.findOne({ owner: req.user._id });
  if (!store || product.store.toString() !== store._id.toString()) {
    return next(new AppError('Not authorized to delete this product', 403));
  }

  await ProductVariant.deleteMany({ product: id });
  await product.deleteOne();

  res.status(200).json({ success: true, message: 'Product deleted successfully' });
});

export const getProductById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const product = await Product.findById(id)
    .populate('store', 'name logoUrl')
    .populate('category', 'name slug');

  if (!product) return next(new AppError('Product not found', 404));

  const variants = await ProductVariant.find({ product: product._id, isActive: true });

  res.status(200).json({ success: true, data: { product, variants } });
});

export const updateProductStock = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { stock } = req.body;

  if (stock === undefined || stock < 0) {
    return next(new AppError('Invalid stock quantity provided', 400));
  }

  const product = await Product.findById(id);
  if (!product) return next(new AppError('Product not found', 404));

  const store = await Store.findOne({ owner: req.user._id });
  if (!store || product.store.toString() !== store._id.toString()) {
    return next(new AppError('Not authorized to update this product', 403));
  }

  const variant = await ProductVariant.findOne({ product: id });
  if (!variant) return next(new AppError('Product variant not found', 404));

  variant.stock = stock;
  await variant.save();

  res.status(200).json({ success: true, data: { variant } });
});
