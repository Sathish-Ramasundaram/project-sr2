# SR Store (project-sr2)

Full-stack grocery store learning project.

## Tech Stack

- Frontend: React + TypeScript + Redux Toolkit + Redux Saga + Tailwind + Rspack
- Backend API: Express + TypeScript + GraphQL Yoga
- Data layer: Hasura GraphQL + PostgreSQL (Docker)
- Workflow orchestration: Temporal (checkout workflow + worker)

## Current Project Structure

```text
project-sr2/
|- front-end/
|  |- src/
|  |  |- components/
|  |  |- pages/
|  |  |- routes/
|  |  |- store/
|  |  |- api/
|  |  |- utils/
|  |- cypress/
|  |- .storybook/
|  |- public/
|  |- rspack.config.js
|  |- package.json
|- back-end/
|  |- hasura/
|  |  |- docker-compose.yml
|  |- server/
|  |  |- express-api/
|  |  |  |- src/
|  |  |  |  |- routes/
|  |  |  |  |- modules/
|  |  |  |  |- middleware/
|  |  |  |  |- graphql/
|  |  |  |  |- lib/
|  |  |  |  |- temporal/
|  |  |  |  |  |- activities/
|  |  |  |  |  |- workflows/
|  |  |  |  |- app.ts
|  |  |  |- package.json
|- README.md
```

## Implemented Features

- Customer register, login, forgot password
- Customer home and catalogue powered by backend/Hasura product data
- Product details page
- Cart flow with quantity controls (`+/-/remove`)
- Checkout flow (order, order items, payment, inventory update, cart clear)
- Stock-aware add-to-cart and out-of-stock UI
- Admin dashboard:
  - add product
  - update unit, category, display order, price, reorder level, stock
  - stock alerts
  - sales graph (date range / last 30 days)
- Cross-tab refresh signal for catalogue/customer pages on admin updates

## Temporal Status

- Temporal checkout workflow is integrated in backend (`src/temporal/`).
- Worker entry is available via `npm run temporal:worker`.
- Event trigger integration is work in progress.

## Prerequisites

- Node.js 18+
- npm
- Docker Desktop

## Environment

Create `back-end/server/express-api/.env`:

```env
PORT=5000
JWT_SECRET=change-this-to-a-very-strong-secret
JWT_EXPIRES_IN=7d
HASURA_GRAPHQL_URL=http://localhost:8080/v1/graphql
HASURA_ADMIN_SECRET=admin123
HASURA_JWT_DEFAULT_ROLE=customer
HASURA_JWT_ALLOWED_ROLES=customer,admin
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=default
TEMPORAL_TASK_QUEUE=checkout-task-queue
```

Important:
- `JWT_SECRET` must match the `key` inside Hasura JWT config.
- `HASURA_ADMIN_SECRET` must match `HASURA_GRAPHQL_ADMIN_SECRET` in docker-compose.

## Run Locally

### 1) Start infrastructure (PostgreSQL + Hasura + Temporal)

```powershell
cd back-end\hasura
docker compose up -d
```

- Hasura console: `http://localhost:8080/console`
- Temporal UI: `http://localhost:8088`

### 2) Start Express API

```powershell
cd back-end\server\express-api
npm install
npm run dev
```

API base URL: `http://localhost:5000`

### 3) Start Temporal worker

```powershell
cd back-end\server\express-api
npm run temporal:worker
```

### 4) Start Frontend

```powershell
cd front-end
npm install
npm run dev
```

Frontend URL: check terminal output.

## Key API Routes

- Health: `GET /api/health`
- Auth:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/forgot`
- Catalogue:
  - `GET /api/catalogue/products`
  - `GET /api/catalogue/students`
- Admin products:
  - `GET /api/admin/products`
  - `POST /api/admin/products`
  - `PATCH /api/admin/products/:productId/category`
  - `PATCH /api/admin/products/:productId/display-order`
  - `PATCH /api/admin/products/:productId/unit`
  - `PATCH /api/admin/products/:productId/price`
  - `PATCH /api/admin/products/:productId/reorder-threshold`
  - `PATCH /api/admin/products/:productId/stock`
- Checkout:
  - `POST /api/checkout/place-order`
  - `GET /api/checkout/status/:workflowId`

## Database Notes

- Products are sorted by admin-defined `display_order` (then name).
- Ensure `products.display_order` exists:

```sql
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 9999;
```

## Useful Commands

### Restart infrastructure

```powershell
cd back-end\hasura
docker compose down
docker compose up -d
```

### Build frontend

```powershell
cd front-end
npm run build
```

### Build backend

```powershell
cd back-end\server\express-api
npm run build
```
