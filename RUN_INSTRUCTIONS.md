# Running the MarketFlow Project

This guide provides step-by-step instructions to get the MarketFlow monorepo up and running locally. 

The project uses [TurboRepo](https://turbo.build/) to manage multiple applications (`api`, `web`, `admin`) and relies on Docker for infrastructure services (MongoDB, Redis).

## Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v11 or higher recommended)
- [Docker](https://www.docker.com/) and Docker Compose

## Step 1: Start Infrastructure (Database & Cache)

MarketFlow requires MongoDB and Redis. These are configured via Docker Compose.

1. Ensure the Docker daemon (e.g., Docker Desktop) is running on your machine.
2. Open a terminal at the root of the project (`MarketFlow/`).
3. Run the following command to start the containers in detached mode:

```bash
docker-compose up -d
```

> [!NOTE]
> You can verify the containers are running correctly using `docker ps`. You should see `marketflow-mongodb` and `marketflow-redis`.

## Step 2: Install Dependencies

Install the Node.js dependencies for the entire monorepo from the root directory:

```bash
npm install
```

## Step 3: Verify Environment Variables

The backend API requires specific environment variables for database connections, JWT secrets, etc. 

Ensure that `apps/api/.env` exists and contains the necessary values. An example of a local development configuration:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://root:password@localhost:27017/marketflow?authSource=admin
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=super_secret_access_token_12345
JWT_REFRESH_SECRET=super_secret_refresh_token_12345
FRONTEND_URL=http://localhost:3000
```

## Step 4: Start the Development Servers

Use TurboRepo to concurrently start the development servers for all applications (`api`, `web`, `admin`) from the root directory:

```bash
npm run dev
```

### Accessing the Applications
Once the servers have started, you can access the applications locally at:
- **API Server (`api:dev`):** `http://localhost:5000` (The backend Express server)
- **Web App (`web:dev`):** `http://localhost:3000` (The main Next.js frontend)
- **Admin App (`admin:dev`):** `http://localhost:3001` (The admin dashboard Next.js frontend)

> [!NOTE]
> Because this is a **monorepo** managed by TurboRepo, running `npm run dev` in the root folder starts the development server for all three apps simultaneously. When you look at your terminal, you will see output prefixed with `web:dev`, `admin:dev`, and `api:dev`—this just tells you which specific app that line of output belongs to.

> [!TIP]
> If you run into issues with the Docker containers, you can stop them with `docker-compose down` and restart them.
