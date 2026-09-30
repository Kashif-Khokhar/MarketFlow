# MarketFlow

MarketFlow is a modern, full-stack multi-vendor marketplace platform. It allows users to browse and purchase products, and enables sellers to manage their own stores, products, and orders. It also features a comprehensive admin dashboard for platform management.

## 🚀 Tech Stack

### Frontend (Apps/Web)
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **State Management & Fetching**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

### Backend (Apps/API)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with [Mongoose](https://mongoosejs.com/)
- **Caching**: Redis (via ioredis)
- **Authentication**: JWT (JSON Web Tokens) & bcrypt

### Monorepo Structure
The project uses a monorepo structure (likely managed with Turborepo or similar workspaces tool) to share code seamlessly between the frontend and backend.

- `apps/api/`: The Express backend application.
- `apps/web/`: The Next.js frontend application.
- `packages/validation/`: Shared validation schemas (Zod).
- `packages/ui/`: Shared UI component library.
- `packages/types/`: Shared TypeScript type definitions.
- `packages/config/`: Shared configuration settings.

## 🌟 Key Features

- **Storefront**: Responsive UI for customers to browse categories, view products, and make purchases.
- **Shopping Cart & Checkout**: Seamless shopping experience with cart management and order creation.
- **Seller Dashboard**: Dedicated portal for sellers to create stores, manage inventory (products/variants), and fulfill orders.
- **Admin Dashboard**: Centralized management for platform administrators to oversee users, stores, platform settings, and analytics.
- **Real-time Interactions**: Support for chat/messaging between users/sellers and real-time notifications.
- **Reviews & Ratings**: Integrated product review system.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or Atlas)
- Redis instance (local or cloud)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Kashif-Khokhar/MarketFlow.git
   cd MarketFlow
   ```

2. Install dependencies:
   ```bash
   npm install
   # or yarn install / pnpm install
   ```

3. Set up environment variables:
   - Create `.env` files in `apps/api/` and `apps/web/` based on the `.env.example` templates (if provided).
   - Ensure you provide valid connection strings for `MONGODB_URI`, `REDIS_URL`, and a secret for `JWT_SECRET`.

4. Start the development servers:
   ```bash
   # If using Turborepo or an overarching start script
   npm run dev
   ```
   *Alternatively, start apps individually:*
   - API: `cd apps/api && npm run dev`
   - Web: `cd apps/web && npm run dev`

5. Open your browser and navigate to `http://localhost:3000` to see the storefront. The API runs on `http://localhost:5000` (or as configured).

## 📄 License
This project is proprietary and intended for demonstration purposes.