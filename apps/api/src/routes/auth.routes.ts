import { Router } from 'express';
import { register, login, logout, refresh, verifyEmail, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '@marketflow/validation';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/verify-email/:token', verifyEmail);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.patch('/reset-password/:token', validate(resetPasswordSchema), resetPassword);

export default router;
