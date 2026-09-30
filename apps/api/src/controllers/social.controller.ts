import { Request, Response, NextFunction } from 'express';
import { Friendship, FriendshipStatus } from '../models/Friendship';
import { Block } from '../models/Block';
import { User } from '../models/User';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth.middleware';

export const sendFriendRequest = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { recipientId } = req.body;
  const requesterId = req.user._id;

  if (requesterId.toString() === recipientId) {
    return next(new AppError('You cannot send a friend request to yourself', 400));
  }

  // Check if blocked
  const isBlocked = await Block.findOne({
    $or: [
      { blocker: requesterId, blocked: recipientId },
      { blocker: recipientId, blocked: requesterId }
    ]
  });

  if (isBlocked) {
    return next(new AppError('Cannot send request to this user', 403));
  }

  const existingRequest = await Friendship.findOne({
    $or: [
      { requester: requesterId, recipient: recipientId },
      { requester: recipientId, recipient: requesterId }
    ]
  });

  if (existingRequest) {
    return next(new AppError('A friend request already exists between you and this user', 400));
  }

  const friendship = await Friendship.create({
    requester: requesterId,
    recipient: recipientId
  });

  res.status(201).json({ success: true, data: { friendship } });
});

export const respondToRequest = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { requestId } = req.params;
  const { status } = req.body; // 'ACCEPTED' or 'REJECTED'

  if (![FriendshipStatus.ACCEPTED, FriendshipStatus.REJECTED].includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  const friendship = await Friendship.findOne({ _id: requestId, recipient: req.user._id });
  
  if (!friendship) {
    return next(new AppError('Friend request not found', 404));
  }

  friendship.status = status;
  await friendship.save();

  res.status(200).json({ success: true, data: { friendship } });
});

export const getFriends = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const friendships = await Friendship.find({
    $or: [{ requester: req.user._id }, { recipient: req.user._id }],
    status: FriendshipStatus.ACCEPTED
  }).populate('requester recipient', 'name avatar role');

  // Extract the actual friend from the friendship document
  const friends = friendships.map(f => {
    return f.requester._id.toString() === req.user._id.toString() ? f.recipient : f.requester;
  });

  res.status(200).json({ success: true, data: { friends } });
});

export const blockUser = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { blockedId } = req.body;

  if (req.user._id.toString() === blockedId) {
    return next(new AppError('You cannot block yourself', 400));
  }

  await Block.create({ blocker: req.user._id, blocked: blockedId });

  // Remove any existing friendship
  await Friendship.deleteOne({
    $or: [
      { requester: req.user._id, recipient: blockedId },
      { requester: blockedId, recipient: req.user._id }
    ]
  });

  res.status(200).json({ success: true, message: 'User blocked successfully' });
});

export const getPendingRequests = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const requests = await Friendship.find({
    recipient: req.user._id,
    status: FriendshipStatus.PENDING
  }).populate('requester', 'name avatar role');

  res.status(200).json({ success: true, data: { requests } });
});

export const removeFriend = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { friendId } = req.params;

  const result = await Friendship.deleteOne({
    $or: [
      { requester: req.user._id, recipient: friendId },
      { requester: friendId, recipient: req.user._id }
    ]
  });

  if (result.deletedCount === 0) {
    return next(new AppError('Friendship not found', 404));
  }

  res.status(200).json({ success: true, message: 'Friend removed successfully' });
});
