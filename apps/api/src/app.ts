import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import socialRoutes from './routes/social.routes';
import chatRoutes from './routes/chat.routes';
import categoryRoutes from './routes/category.routes';
import sellerRoutes from './routes/seller.routes';
import productRoutes from './routes/product.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import couponRoutes from './routes/coupon.routes';
import paymentRoutes from './routes/payment.routes';
import reviewRoutes from './routes/review.routes';
import notificationRoutes from './routes/notification.routes';
import dashboardRoutes from './routes/dashboard.routes';

const app = express();

// Trust reverse proxy (important for rate limiting when behind a load balancer or Nginx)
app.set('trust proxy', 1);
// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// Body Parser & Cookie Parser
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Serve uploaded static files
import path from 'path';
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Apply rate limiter to all API requests
app.use('/api', apiLimiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/social', socialRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/sellers', sellerRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/dashboards', dashboardRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Unhandled Routes
app.all('*', (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
