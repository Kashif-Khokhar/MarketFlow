import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}

export const createRateLimiter = ({ windowMs, maxRequests, keyPrefix }: RateLimiterOptions) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Determine client identifier (IP address)
    // Using req.ip which works perfectly if 'trust proxy' is set in express
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${keyPrefix}:${ip}`;

    // Increment request count for this IP
    const currentRequests = await redis.incr(key);

    // If it's the first request, set the expiration window
    if (currentRequests === 1) {
      await redis.pexpire(key, windowMs);
    }

    if (currentRequests > maxRequests) {
      return next(new AppError('Too many requests from this IP, please try again later.', 429));
    }

    next();
  });
};

// Common limiters
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 20, // Limit each IP to 20 requests per windowMs for auth routes
  keyPrefix: 'rate_limit:auth',
});

export const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // Limit each IP to 100 requests per windowMs for general API
  keyPrefix: 'rate_limit:api',
});
