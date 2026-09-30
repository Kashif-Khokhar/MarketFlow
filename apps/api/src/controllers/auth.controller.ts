import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, IUser } from '../models/User';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';
import { redis } from '../config/redis';
import { emailService } from '../services/EmailService';

const signToken = (id: string, secret: string, expiresIn: string) => {
  return jwt.sign({ id }, secret, { expiresIn: expiresIn as any });
};

const createSendToken = async (user: IUser, statusCode: number, res: Response) => {
  const userId = user._id ? user._id.toString() : '';
  const accessToken = signToken(userId, env.JWT_ACCESS_SECRET, '15m');
  const refreshToken = signToken(userId, env.JWT_REFRESH_SECRET, '7d');

  // Store refresh token family/state in Redis for rotation/revocation
  await redis.set(`refresh_token:${userId}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);
  
  // Optional: Return access token in JSON body (or also in a cookie depending on frontend preference)
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    data: {
      user,
      accessToken,
    },
  });
};

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email already in use', 400));
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  // Generate verification token (mock implementation for now)
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const userIdStr = user._id ? user._id.toString() : '';
  await redis.set(`verify_email:${verificationToken}`, userIdStr, 'EX', 24 * 60 * 60);

  await emailService.sendVerificationEmail(user.email, verificationToken);

  createSendToken(user, 201, res);
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (!user.isActive) {
    return next(new AppError('This account has been deactivated.', 401));
  }

  createSendToken(user, 200, res);
});

export const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (refreshToken) {
    try {
      const decoded: any = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
      await redis.del(`refresh_token:${decoded.id}`);
    } catch (err) {
      // Ignore token verification errors on logout
    }
  }

  res.cookie('accessToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  
  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

export const refresh = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(new AppError('No refresh token provided', 401));
  }

  try {
    const decoded: any = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    
    // Check if refresh token matches the one in Redis (prevent token reuse/hijacking)
    const storedToken = await redis.get(`refresh_token:${decoded.id}`);
    
    if (!storedToken || storedToken !== refreshToken) {
      // Token reuse detected or token revoked
      await redis.del(`refresh_token:${decoded.id}`); // Revoke all access
      return next(new AppError('Invalid refresh token. Please login again.', 401));
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return next(new AppError('User not found or deactivated', 401));
    }

    // Rotate refresh token
    createSendToken(user, 200, res);
  } catch (error) {
    return next(new AppError('Invalid or expired refresh token', 401));
  }
});

export const verifyEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;

  const userId = await redis.get(`verify_email:${token}`);
  if (!userId) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  await redis.del(`verify_email:${token}`);

  res.status(200).json({
    success: true,
    message: 'Email successfully verified',
  });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Store token in redis
  const userIdStr = user._id ? user._id.toString() : '';
  await redis.set(`reset_password:${resetToken}`, userIdStr, 'EX', 10 * 60); // 10 minutes

  try {
    await emailService.sendPasswordResetEmail(user.email, resetToken);

    res.status(200).json({
      success: true,
      message: 'Token sent to email!',
    });
  } catch (err) {
    await redis.del(`reset_password:${resetToken}`);
    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;
  const { password } = req.body;

  const userId = await redis.get(`reset_password:${token}`);
  if (!userId) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.password = password;
  await user.save();

  // Invalidate all existing refresh tokens
  await redis.del(`refresh_token:${userId}`);

  // Delete the reset token
  await redis.del(`reset_password:${token}`);

  // Log the user in, send JWT
  createSendToken(user, 200, res);
});
