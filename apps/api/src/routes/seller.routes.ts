import { Router } from 'express';
import { createStore, getStore, updateStore, getStoreProducts, uploadLogo, getPublicStores } from '../controllers/seller.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';
import { validate } from '../middleware/validate';
import { createStoreSchema, updateStoreSchema } from '@marketflow/validation';
import { upload } from '../middleware/upload';

const router = Router();

// Public routes
router.get('/store/public', getPublicStores);

// Store creation is open to any authenticated user (they become a seller)
router.use(protect);
router.post('/store', validate(createStoreSchema), createStore);

// Following routes are strictly for existing sellers
router.use(restrictTo(UserRole.SELLER));

router.get('/store', getStore);
router.patch('/store', validate(updateStoreSchema), updateStore);
router.patch('/store/logo', upload.single('logo'), uploadLogo);
router.get('/store/products', getStoreProducts);

export default router;
