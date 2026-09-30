import { Router } from 'express';
import { createProduct, getProducts, getProductBySlug, uploadProductImages, updateProduct, deleteProduct, getProductById, updateProductStock } from '../controllers/product.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';
import { validate } from '../middleware/validate';
import { createProductSchema, updateProductSchema } from '@marketflow/validation';
import { upload } from '../middleware/upload';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.get('/id/:id', getProductById);

// Seller protected routes
router.use(protect, restrictTo(UserRole.SELLER));
router.post('/', validate(createProductSchema), createProduct);
router.patch('/:id/images', upload.array('images', 5), uploadProductImages);
router.patch('/:id/stock', updateProductStock);
router.patch('/:id', validate(updateProductSchema), updateProduct);
router.delete('/:id', deleteProduct);

export default router;
