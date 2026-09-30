import { Router } from 'express';
import { createReview, getReviews, deleteReview } from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createReviewSchema } from '@marketflow/validation';

const router = Router();

// Public
router.get('/', getReviews);

// Protected
router.use(protect);
router.post('/', validate(createReviewSchema), createReview);
router.delete('/:id', deleteReview);

export default router;
