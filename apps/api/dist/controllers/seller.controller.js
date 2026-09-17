"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoreProducts = exports.updateStore = exports.getStore = exports.uploadLogo = exports.createStore = void 0;
const Store_1 = require("../models/Store");
const Product_1 = require("../models/Product");
const User_1 = require("../models/User");
const catchAsync_1 = require("../utils/catchAsync");
const AppError_1 = require("../utils/AppError");
const StorageService_1 = require("../services/StorageService");
exports.createStore = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { name, description, logoUrl } = req.body;
    const existingStore = await Store_1.Store.findOne({ owner: req.user._id });
    if (existingStore) {
        return next(new AppError_1.AppError('You already have a store', 400));
    }
    const existingName = await Store_1.Store.findOne({ name });
    if (existingName) {
        return next(new AppError_1.AppError('Store name already taken', 400));
    }
    const store = await Store_1.Store.create({
        owner: req.user._id,
        name,
        description,
        logoUrl,
    });
    await User_1.User.findByIdAndUpdate(req.user._id, { role: User_1.UserRole.SELLER });
    res.status(201).json({ success: true, data: { store } });
});
exports.uploadLogo = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError_1.AppError('Please upload an image file', 400));
    }
    const store = await Store_1.Store.findOne({ owner: req.user._id });
    if (!store) {
        return next(new AppError_1.AppError('Store not found', 404));
    }
    const logoUrl = await StorageService_1.storageService.upload(req.file.buffer, req.file.mimetype, req.file.originalname);
    store.logoUrl = logoUrl;
    await store.save();
    res.status(200).json({ success: true, data: { store } });
});
exports.getStore = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const store = await Store_1.Store.findOne({ owner: req.user._id });
    if (!store) {
        return next(new AppError_1.AppError('Store not found', 404));
    }
    res.status(200).json({ success: true, data: { store } });
});
exports.updateStore = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { name, description, logoUrl } = req.body;
    const store = await Store_1.Store.findOne({ owner: req.user._id });
    if (!store) {
        return next(new AppError_1.AppError('Store not found', 404));
    }
    if (name && name !== store.name) {
        const existingName = await Store_1.Store.findOne({ name });
        if (existingName)
            return next(new AppError_1.AppError('Store name already taken', 400));
        store.name = name;
    }
    if (description)
        store.description = description;
    if (logoUrl)
        store.logoUrl = logoUrl;
    await store.save();
    res.status(200).json({ success: true, data: { store } });
});
exports.getStoreProducts = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const store = await Store_1.Store.findOne({ owner: req.user._id });
    if (!store)
        return next(new AppError_1.AppError('Store not found', 404));
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const products = await Product_1.Product.find({ store: store._id })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort('-createdAt');
    const total = await Product_1.Product.countDocuments({ store: store._id });
    res.status(200).json({
        success: true,
        data: {
            products,
            pagination: { total, page, pages: Math.ceil(total / limit) }
        }
    });
});
