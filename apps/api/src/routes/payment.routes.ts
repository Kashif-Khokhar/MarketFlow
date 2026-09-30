import { Router } from 'express';
import { createPaymentIntent, webhook } from '../controllers/payment.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/create-intent', protect, createPaymentIntent);

// Webhook must not be protected by auth middleware, Stripe sends requests here directly
// Note: In real life, the body parser for this route should be raw() instead of json()
router.post('/webhook', webhook);

export default router;
