import { Router } from 'express';
import { createOrder, getMyOrders, getSellerOrders, updateOrderStatus, requestReturn, processReturn } from '../controllers/order.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';
import { validate } from '../middleware/validate';
import { createOrderSchema, updateOrderStatusSchema } from '@marketflow/validation';

const router = Router();

router.use(protect);

// Customer routes
router.post('/', validate(createOrderSchema), createOrder);
router.get('/my-orders', getMyOrders);
router.post('/:id/return', requestReturn);

// Seller routes
router.get('/seller-orders', restrictTo(UserRole.SELLER), getSellerOrders);
router.patch('/seller-orders/:id/status', restrictTo(UserRole.SELLER), validate(updateOrderStatusSchema), updateOrderStatus);
router.patch('/seller-orders/:id/process-return', restrictTo(UserRole.SELLER), processReturn);

export default router;
