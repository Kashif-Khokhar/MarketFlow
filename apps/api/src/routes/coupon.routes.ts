import { Router } from 'express';
import { createCoupon, getStoreCoupons, applyCoupon } from '../controllers/coupon.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';
import { validate } from '../middleware/validate';
import { createCouponSchema, applyCouponSchema } from '@marketflow/validation';

const router = Router();

router.use(protect);

router.post('/apply', validate(applyCouponSchema), applyCoupon);

// Store owners/Admins
router.post('/', restrictTo(UserRole.SELLER, UserRole.ADMIN), validate(createCouponSchema), createCoupon);
router.get('/', restrictTo(UserRole.SELLER), getStoreCoupons);

export default router;
