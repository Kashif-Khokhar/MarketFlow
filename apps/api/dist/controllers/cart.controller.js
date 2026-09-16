"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeCartItem = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const Cart_1 = require("../models/Cart");
const Product_1 = require("../models/Product");
const ProductVariant_1 = require("../models/ProductVariant");
const catchAsync_1 = require("../utils/catchAsync");
const AppError_1 = require("../utils/AppError");
exports.getCart = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    let cart = await Cart_1.Cart.findOne({ user: req.user._id })
        .populate('items.product', 'name slug images basePrice')
        .populate('items.variant', 'sku price attributes stock images')
        .populate('items.store', 'name');
    if (!cart) {
        cart = await Cart_1.Cart.create({ user: req.user._id, items: [] });
    }
    res.status(200).json({ success: true, data: { cart } });
});
exports.addToCart = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { productId, variantId, quantity } = req.body;
    const product = await Product_1.Product.findById(productId);
    if (!product)
        return next(new AppError_1.AppError('Product not found', 404));
    const variant = await ProductVariant_1.ProductVariant.findById(variantId);
    if (!variant || variant.product.toString() !== productId) {
        return next(new AppError_1.AppError('Variant not found or does not belong to product', 404));
    }
    // Check stock
    const availableStock = variant.stock - variant.reservedStock;
    if (availableStock < quantity) {
        return next(new AppError_1.AppError(`Only ${availableStock} items left in stock`, 400));
    }
    let cart = await Cart_1.Cart.findOne({ user: req.user._id });
    if (!cart) {
        cart = new Cart_1.Cart({ user: req.user._id, items: [] });
    }
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex((item) => item.variant.toString() === variantId);
    if (existingItemIndex > -1) {
        // Check if new total quantity exceeds stock
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        if (availableStock < newQuantity) {
            return next(new AppError_1.AppError(`Only ${availableStock} items left in stock`, 400));
        }
        cart.items[existingItemIndex].quantity = newQuantity;
    }
    else {
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
exports.updateCartItem = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const cart = await Cart_1.Cart.findOne({ user: req.user._id });
    if (!cart)
        return next(new AppError_1.AppError('Cart not found', 404));
    const item = cart.items.find((item) => item._id.toString() === itemId);
    if (!item)
        return next(new AppError_1.AppError('Item not found in cart', 404));
    const variant = await ProductVariant_1.ProductVariant.findById(item.variant);
    if (!variant)
        return next(new AppError_1.AppError('Variant not found', 404));
    const availableStock = variant.stock - variant.reservedStock;
    if (availableStock < quantity) {
        return next(new AppError_1.AppError(`Only ${availableStock} items left in stock`, 400));
    }
    item.quantity = quantity;
    await cart.save();
    await cart.populate(['items.product', 'items.variant', 'items.store']);
    res.status(200).json({ success: true, data: { cart } });
});
exports.removeCartItem = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { itemId } = req.params;
    const cart = await Cart_1.Cart.findOne({ user: req.user._id });
    if (!cart)
        return next(new AppError_1.AppError('Cart not found', 404));
    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();
    await cart.populate(['items.product', 'items.variant', 'items.store']);
    res.status(200).json({ success: true, data: { cart } });
});
exports.clearCart = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const cart = await Cart_1.Cart.findOneAndUpdate({ user: req.user._id }, { items: [] }, { new: true });
    res.status(200).json({ success: true, data: { cart } });
});
