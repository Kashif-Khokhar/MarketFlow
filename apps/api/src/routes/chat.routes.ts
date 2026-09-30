import { Router } from 'express';
import { getConversations, getMessages, sendMessage } from '../controllers/chat.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/conversations', getConversations);
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/messages', sendMessage);

export default router;
