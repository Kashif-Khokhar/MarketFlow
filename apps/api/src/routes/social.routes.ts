import { Router } from 'express';
import { sendFriendRequest, respondToRequest, getFriends, blockUser, getPendingRequests, removeFriend } from '../controllers/social.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.post('/friends/request', sendFriendRequest);
router.patch('/friends/request/:requestId', respondToRequest);
router.get('/friends/requests/pending', getPendingRequests);
router.get('/friends', getFriends);
router.delete('/friends/:friendId', removeFriend);
router.post('/block', blockUser);

export default router;
