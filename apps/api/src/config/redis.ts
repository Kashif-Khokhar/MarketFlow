import { Redis } from 'ioredis';
import { env } from './env';

// For serverless environments like Vercel, caching the connection 
// prevents exhausting connections during cold starts.
const globalForRedis = global as unknown as { redis: Redis };

export const redis = globalForRedis.redis || new Redis(env.REDIS_URL);

if (env.NODE_ENV !== 'production') globalForRedis.redis = redis;

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});
