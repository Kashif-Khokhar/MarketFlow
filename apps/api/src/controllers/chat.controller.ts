import { Request, Response, NextFunction } from 'express';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth.middleware';

export const getConversations = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate('participants', 'name avatar')
    .populate('lastMessage')
    .sort('-updatedAt');

  res.status(200).json({ success: true, data: { conversations } });
});

export const getMessages = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { conversationId } = req.params;
  
  // Verify participation
  const conversation = await Conversation.findOne({ _id: conversationId, participants: req.user._id });
  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  const messages = await Message.find({ conversation: conversationId })
    .sort('createdAt')
    .limit(50); // Pagination can be added here

  res.status(200).json({ success: true, data: { messages } });
});

export const sendMessage = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { recipientId, text, conversationId } = req.body;
  
  let conversation;

  if (conversationId) {
    conversation = await Conversation.findOne({ _id: conversationId, participants: req.user._id });
  } else if (recipientId) {
    // Find existing or create new
    conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId] }
    });
    
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId]
      });
    }
  }

  if (!conversation) {
    return next(new AppError('Conversation target required', 400));
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    text,
    readBy: [req.user._id]
  });

  conversation.lastMessage = message._id as any;
  await conversation.save();

  // In the future: Trigger Pusher Realtime Event Here

  res.status(201).json({ success: true, data: { message } });
});
