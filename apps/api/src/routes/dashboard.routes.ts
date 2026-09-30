import { Router } from 'express';
import { getAdminStats, getSellerStats, getCustomerStats } from '../controllers/dashboard.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';

const router = Router();

router.use(protect);

router.get('/customer', getCustomerStats);
router.get('/seller', restrictTo(UserRole.SELLER), getSellerStats);
router.get('/admin', restrictTo(UserRole.ADMIN), getAdminStats);

export default router;
