import { Router } from 'express';
import { createCategory, getCategories } from '../controllers/category.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';
import { validate } from '../middleware/validate';
import { createCategorySchema } from '@marketflow/validation';

const router = Router();

router.get('/', getCategories);

router.use(protect, restrictTo(UserRole.ADMIN));
router.post('/', validate(createCategorySchema), createCategory);

export default router;
