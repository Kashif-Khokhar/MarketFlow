import { Request, Response, NextFunction } from 'express';
import slugify from 'slugify';
import { Category } from '../models/Category';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

export const createCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, description, parent, imageUrl } = req.body;

  const slug = slugify(name, { lower: true, strict: true });
  
  const existing = await Category.findOne({ slug });
  if (existing) return next(new AppError('Category already exists', 400));

  const category = await Category.create({
    name,
    slug,
    description,
    parent,
    imageUrl,
  });

  res.status(201).json({ success: true, data: { category } });
});

import { Product, ProductStatus } from '../models/Product';

export const getCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const categories = await Category.find({ isActive: true }).populate('parent', 'name slug').lean();
  
  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      const productCount = await Product.countDocuments({ 
        category: category._id,
        status: ProductStatus.ACTIVE 
      });
      return { ...category, productCount };
    })
  );

  res.status(200).json({ success: true, data: { categories: categoriesWithCounts } });
});
