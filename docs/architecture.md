# MarketFlow Architecture

## FREE-TIER / $0 DEPLOYMENT ARCHITECTURE
MarketFlow is designed to be deployed for **$0/month** using serverless technologies compatible with Vercel. 

### Why Vercel?
Vercel provides an industry-leading free tier for hosting Next.js applications and Serverless Functions, making it the ideal target for a $0 deployment.

### Serverless-Compatible Architecture
Because Vercel environments are ephemeral, the architecture avoids long-running processes:
- **No persistent memory state**: All sessions and rate limits are backed by Redis (Upstash).
- **No Socket.IO**: Realtime events are outsourced to Pusher.
- **No BullMQ**: Background jobs are managed via Upstash QStash which triggers HTTP webhooks.

## Infrastructure Breakdown
- **apps/web**: Next.js (Vercel)
- **apps/admin**: Next.js (Vercel)
- **apps/api**: Express.js wrapped in `serverless-http` (Vercel Serverless Function)
- **Database**: MongoDB Atlas M0 Cluster
- **Cache**: Upstash Redis (10k requests/day)
- **Realtime**: Pusher (200k messages/day)
- **Jobs**: Upstash QStash (500 messages/day)
- **Storage**: Cloudinary (25 credits/month)
- **Emails**: Resend (3,000 emails/month)
- **Payments**: Stripe Test Mode (Free)

## Local Development
Local development uses Docker Compose to mimic the production dependencies where applicable (MongoDB, Redis), and mock adapters for external services (MockEmailAdapter, MockPaymentProvider) to ensure the application runs seamlessly without API keys.
