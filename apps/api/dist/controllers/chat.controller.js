"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.getMessages = exports.getConversations = void 0;
const Conversation_1 = require("../models/Conversation");
const Message_1 = require("../models/Message");
const catchAsync_1 = require("../utils/catchAsync");
const AppError_1 = require("../utils/AppError");
exports.getConversations = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const conversations = await Conversation_1.Conversation.find({ participants: req.user._id })
        .populate('participants', 'name avatar')
        .populate('lastMessage')
        .sort('-updatedAt');
    res.status(200).json({ success: true, data: { conversations } });
});
exports.getMessages = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { conversationId } = req.params;
    // Verify participation
    const conversation = await Conversation_1.Conversation.findOne({ _id: conversationId, participants: req.user._id });
    if (!conversation) {
        return next(new AppError_1.AppError('Conversation not found', 404));
    }
    const messages = await Message_1.Message.find({ conversation: conversationId })
        .sort('createdAt')
        .limit(50); // Pagination can be added here
    res.status(200).json({ success: true, data: { messages } });
});
exports.sendMessage = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { recipientId, text, conversationId } = req.body;
    let conversation;
    if (conversationId) {
        conversation = await Conversation_1.Conversation.findOne({ _id: conversationId, participants: req.user._id });
    }
    else if (recipientId) {
        // Find existing or create new
        conversation = await Conversation_1.Conversation.findOne({
            participants: { $all: [req.user._id, recipientId] }
        });
        if (!conversation) {
            conversation = await Conversation_1.Conversation.create({
                participants: [req.user._id, recipientId]
            });
        }
    }
    if (!conversation) {
        return next(new AppError_1.AppError('Conversation target required', 400));
    }
    const message = await Message_1.Message.create({
        conversation: conversation._id,
        sender: req.user._id,
        text,
        readBy: [req.user._id]
    });
    conversation.lastMessage = message._id;
    await conversation.save();
    // In the future: Trigger Pusher Realtime Event Here
    res.status(201).json({ success: true, data: { message } });
});
