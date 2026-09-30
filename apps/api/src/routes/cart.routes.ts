import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cart.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { addToCartSchema, updateCartItemSchema } from '@marketflow/validation';

const router = Router();

router.use(protect);

router.get('/', getCart);
router.post('/', validate(addToCartSchema), addToCart);
router.patch('/items/:itemId', validate(updateCartItemSchema), updateCartItem);
router.delete('/items/:itemId', removeCartItem);
router.delete('/', clearCart);

export default router;
