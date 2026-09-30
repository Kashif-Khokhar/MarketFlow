import serverless from 'serverless-http';
import app from './app';
import { connectDB } from './config/database';
import { env } from './config/env';

// For local development
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  });
}

// Serverless export for Vercel
let serverlessHandler: any;

export const handler = async (event: any, context: any) => {
  if (!serverlessHandler) {
    await connectDB(); // Ensure DB is connected for cold starts
    serverlessHandler = serverless(app);
  }
  return serverlessHandler(event, context);
};
