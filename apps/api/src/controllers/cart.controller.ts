import { Request, Response, NextFunction } from 'express';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { ProductVariant } from '../models/ProductVariant';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth.middleware';

export const getCart = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product', 'name slug images basePrice')
    .populate('items.variant', 'sku price attributes stock images')
    .populate('items.store', 'name');

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.status(200).json({ success: true, data: { cart } });
});

export const addToCart = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { productId, variantId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product) return next(new AppError('Product not found', 404));

  const variant = await ProductVariant.findById(variantId);
  if (!variant || variant.product.toString() !== productId) {
    return next(new AppError('Variant not found or does not belong to product', 404));
  }

  // Check stock
  const availableStock = variant.stock - variant.reservedStock;
  if (availableStock < quantity) {
    return next(new AppError(`Only ${availableStock} items left in stock`, 400));
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  // Check if item already exists in cart
  const existingItemIndex = cart.items.findIndex(
    (item: any) => item.variant.toString() === variantId
  );

  if (existingItemIndex > -1) {
    // Check if new total quantity exceeds stock
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;
    if (availableStock < newQuantity) {
      return next(new AppError(`Only ${availableStock} items left in stock`, 400));
    }
    cart.items[existingItemIndex].quantity = newQuantity;
  } else {
    cart.items.push({
      product: product._id,
      variant: variant._id,
      store: product.store,
      quantity
    });
  }

  await cart.save();
  await cart.populate(['items.product', 'items.variant', 'items.store']);

  res.status(200).json({ success: true, data: { cart } });
});

export const updateCartItem = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new AppError('Cart not found', 404));

  const item = cart.items.find((item: any) => item._id.toString() === itemId);
  if (!item) return next(new AppError('Item not found in cart', 404));

  const variant = await ProductVariant.findById(item.variant);
  if (!variant) return next(new AppError('Variant not found', 404));

  const availableStock = variant.stock - variant.reservedStock;
  if (availableStock < quantity) {
    return next(new AppError(`Only ${availableStock} items left in stock`, 400));
  }

  item.quantity = quantity;
  await cart.save();
  await cart.populate(['items.product', 'items.variant', 'items.store']);

  res.status(200).json({ success: true, data: { cart } });
});

export const removeCartItem = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new AppError('Cart not found', 404));

  cart.items = cart.items.filter((item: any) => item._id.toString() !== itemId);
  await cart.save();
  await cart.populate(['items.product', 'items.variant', 'items.store']);

  res.status(200).json({ success: true, data: { cart } });
});

export const clearCart = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [] },
    { new: true }
  );

  res.status(200).json({ success: true, data: { cart } });
});
