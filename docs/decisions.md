# Architectural Decisions

## 1. Deployment Target & $0 Cost Constraint
**Decision**: The entire application will be deployed using free-tier services, targeting Vercel for both frontends and the API. 
**Rationale**: Vercel offers a robust free tier for Next.js applications and Serverless Functions. We use MongoDB Atlas (Free Tier) and Upstash Redis (Free Tier) to maintain zero cost.
**Implications**: The architecture must be entirely serverless-compatible. Long-running processes, persistent background workers, and persistent WebSocket connections to the API are not supported.

## 2. API Architecture (Express on Vercel)
**Decision**: The backend API remains in Express but is wrapped with `serverless-http` for production deployment on Vercel.
**Rationale**: Keeps the business logic independent from the Next.js runtime, ensuring a clean separation of concerns and easier migration to a VPS if needed in the future, while fulfilling the $0 Vercel constraint.

## 3. Realtime Strategy
**Decision**: Use Pusher (Free Tier) instead of Socket.IO.
**Rationale**: Vercel Serverless functions cannot maintain persistent WebSocket connections like a traditional Node server. Pusher manages the connection state externally and triggers serverless functions via webhooks.

## 4. Background Jobs Strategy
**Decision**: Use Upstash QStash instead of BullMQ.
**Rationale**: BullMQ requires a persistent Node.js worker polling Redis. QStash allows enqueueing jobs directly from serverless functions and executes them by making HTTP webhook calls back to our API.

## 5. Storage Strategy
**Decision**: Abstracted `StorageService` (Mock/Local for Dev, Cloudinary for Prod).
**Rationale**: Avoids hard coupling to AWS S3. Cloudinary provides a generous free tier suitable for image uploads.

## 6. Email Strategy
**Decision**: Abstracted `EmailService` (Mock for Dev, Resend for Prod).
**Rationale**: Allows local development without credentials and uses Resend's 3,000/month free tier for realistic production simulation.

## 7. Payments Strategy
**Decision**: Abstracted `PaymentProvider` (Mock for Dev, Stripe Test Mode for Prod).
**Rationale**: Guarantees no real money or card storage is required, strictly adhering to the $0 constraint while simulating complex payment workflows.
