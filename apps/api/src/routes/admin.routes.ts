import { Router } from 'express';
import { getAllUsers, suspendUser, reactivateUser, getAllStores, getStoreProducts, getAllOrders, overrideOrderStatus } from '../controllers/admin.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';

const router = Router();

// Protect and restrict all admin routes
router.use(protect, restrictTo(UserRole.ADMIN));

router.get('/users', getAllUsers);
router.patch('/users/:id/suspend', suspendUser);
router.patch('/users/:id/reactivate', reactivateUser);

router.get('/stores', getAllStores);
router.get('/stores/:id/products', getStoreProducts);

router.get('/orders', getAllOrders);
router.patch('/orders/:id/override-status', overrideOrderStatus);

export default router;
