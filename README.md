# Nirai — Business Management for Tamil Nadu Merchants

Nirai (நிறை — *"complete"* in Tamil) is a full-stack CRUD business management app built for small Tamil Nadu merchants. Track sales, purchases, customers, stock levels, and profit margins in one clean dashboard.

🌐 **Demo page:** [bvigneshraja.github.io/nirai](https://bvigneshraja.github.io/nirai/)

---

## Screenshots

| Dashboard | Sales Entry | Customers |
|-----------|-------------|-----------|
| KPI cards, margin trend, product margin % | Multi-item sales with live margin calc | Role-based masking for phone numbers |

---

## Features

- **Dashboard** — Total revenue, gross margin, outstanding, per-day margin trend, product-wise margin %, top customers by outstanding, low stock alerts
- **Sales Entry** — Multi-item sales with cost/unit, selling price, margin/unit, and total margin columns
- **Purchases** — Record stock-in from suppliers, auto-updates product stock levels
- **Customers** — Full directory with credit limits, contact info, and location
- **Customer Balance** — Outstanding per customer, payment tracking
- **Products** — Manage catalogue with default cost and unit of measurement
- **Role-based access** — `SUPER_ADMIN` (full access) / `ADMIN` (read-only, phone masked)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| State / Data | TanStack Query v5, React Hook Form, Zod |
| Charts | Recharts |
| Backend | Node.js, Fastify 4 |
| ORM | Prisma |
| Database | SQLite (file-based, zero config) |
| Cache | Redis |
| Auth | JWT (jsonwebtoken) |
| Monorepo | npm workspaces |

---

## Prerequisites

Install these before running the project:

### 1. Node.js (v18 or higher)

```bash
# Check version
node -v   # should be >= 18.0.0
```

Install via [nodejs.org](https://nodejs.org/) or with nvm:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Install and use Node 20
nvm install 20
nvm use 20
```

### 2. Redis

Redis is used to cache dashboard stats (60-second TTL).

**macOS (Homebrew):**
```bash
brew install redis
brew services start redis
```

**Ubuntu / Debian:**
```bash
sudo apt update && sudo apt install redis-server
sudo systemctl enable --now redis-server
```

**Windows (WSL recommended):**
```bash
# Inside WSL2 Ubuntu
sudo apt install redis-server
sudo service redis-server start
```

Verify Redis is running:
```bash
redis-cli ping   # should return PONG
```

### 3. SQLite

SQLite is **file-based** — no server install needed. It ships with Prisma automatically.

---

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/bvigneshraja/nirai.git
cd nirai
```

### 2. Install dependencies

```bash
npm install
```

This installs packages for all three workspaces (`apps/api`, `apps/web`, `packages/schemas`) in one shot.

### 3. Configure the API environment

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` — the defaults work for local development:

```env
DATABASE_URL=file:../../prisma/prisma/dev.db
REDIS_URL=redis://localhost:6379
JWT_SECRET=nirai_dev_secret_2024
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

> **Note:** `DATABASE_URL` uses the `file:` protocol for SQLite. The path is relative to `apps/api/` — adjust it if you move the db file.

### 4. Run database migrations

```bash
npm run db:migrate
```

This creates the SQLite database file at `prisma/prisma/dev.db` and applies all schema migrations.

### 5. Generate Prisma client

```bash
npm run db:generate
```

### 6. Seed initial data (optional)

```bash
# Seed users, customers, products
DATABASE_URL=file:/$(pwd)/prisma/prisma/dev.db \
  npx ts-node --transpile-only --compiler-options '{"module":"CommonJS","esModuleInterop":true}' \
  prisma/seed.ts
```

Default seeded users:

| Email | Password | Role |
|-------|----------|------|
| `admin@nirai.com` | `admin123` | `SUPER_ADMIN` |

### 7. Start the servers

Open two terminals (or use a split terminal):

**Terminal 1 — API server (port 4000):**
```bash
npm run dev:api
```

**Terminal 2 — Web app (port 3000):**
```bash
npm run dev:web
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
nirai/
├── apps/
│   ├── api/                  # Fastify backend
│   │   ├── src/
│   │   │   ├── routes/       # REST endpoints (customers, sales, purchases …)
│   │   │   ├── services/     # Business logic
│   │   │   ├── hooks/        # authenticate.ts, authorize.ts
│   │   │   └── lib/          # prisma.ts, redis.ts
│   │   └── .env              # API environment variables
│   │
│   └── web/                  # React + Vite frontend
│       └── src/
│           ├── pages/        # DashboardPage, SalesPage, CustomersPage …
│           ├── components/   # Shared UI (Table, Modal, Button …)
│           ├── hooks/        # useRole.ts
│           └── store/        # auth.store.ts (Zustand)
│
├── packages/
│   └── schemas/              # Shared Zod schemas (SaleSchema, PurchaseSchema …)
│
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── seed.ts               # Initial data seed
│   └── prisma/dev.db         # SQLite database file (git-ignored)
│
└── docs/                     # GitHub Pages landing page
```

---

## Available Scripts

Run from the repo root:

| Script | Description |
|--------|-------------|
| `npm run dev:api` | Start API server with hot-reload (port 4000) |
| `npm run dev:web` | Start Vite dev server (port 3000) |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Regenerate Prisma client after schema changes |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run db:seed` | Seed the database with initial data |

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Login, returns JWT |
| `GET` | `/customers` | List customers (phone masked for ADMIN) |
| `POST` | `/customers` | Create customer (SUPER_ADMIN only) |
| `PATCH` | `/customers/:id` | Update customer (SUPER_ADMIN only) |
| `DELETE` | `/customers/:id` | Delete customer (SUPER_ADMIN only) |
| `GET` | `/products` | List products with stock levels |
| `GET` | `/purchases` | List purchases with per-item rows |
| `POST` | `/purchases` | Record a purchase |
| `GET` | `/sales` | List sales with margin columns |
| `POST` | `/sales` | Record a sale |
| `GET` | `/balance` | Customer balances |
| `GET` | `/dashboard` | Aggregated stats + charts data (cached 60s) |

---

## Troubleshooting

**Redis connection refused**
```bash
# macOS
brew services restart redis

# Linux
sudo systemctl restart redis-server
```

**Prisma client not found**
```bash
npm run db:generate
```

**Port already in use**
```bash
# Kill process on port 4000 or 3000
lsof -ti:4000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

**SQLite database locked**
Close any open Prisma Studio tabs and restart the API server.

---

## License

MIT — free to use, modify, and self-host.
