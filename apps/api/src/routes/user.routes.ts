import { Router } from 'express';
import { getProfile, updateProfile, addAddress, deleteAddress, uploadAvatar } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { updateProfileSchema, addressSchema } from '@marketflow/validation';
import { upload } from '../middleware/upload';

const router = Router();

// All user routes are protected
router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', validate(updateProfileSchema), updateProfile);
router.post('/address', validate(addressSchema), addAddress);
router.delete('/address/:addressId', deleteAddress);
router.patch('/avatar', upload.single('avatar'), uploadAvatar);

export default router;
