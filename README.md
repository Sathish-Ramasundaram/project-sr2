# SR Store (project-sr2)

Full-stack grocery store learning project.

## Tech Stack

- Frontend: React + TypeScript + Redux Toolkit + Redux Saga + Tailwind + Rspack
- Backend API: Express + TypeScript
- Data/API layer: Hasura GraphQL + PostgreSQL (Docker)

## Repository Structure

- `front-end/` - customer and admin UI
- `back-end/server/express-api/` - Express API (auth, catalogue, admin product management, checkout)
- `back-end/hasura/` - PostgreSQL + Hasura Docker compose

## Implemented Features

- Customer register, login, forgot password
- Customer home and catalogue powered by backend/Hasura product data
- Product details page
- Cart flow with quantity controls (`+/-/remove`)
- Checkout flow:
  - create order
  - create order_items
  - create payment (demo success)
  - update order status
  - clear cart
- Stock-aware add-to-cart and out-of-stock UI
- Admin dashboard:
  - add product
  - update unit, category, display order, price, reorder level, stock
  - stock alerts
  - sales graph (date range / last 30 days)
- Cross-tab refresh signal for catalogue/customer pages on admin updates

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
```

Important:
- `JWT_SECRET` must match the `key` inside Hasura JWT config.
- `HASURA_ADMIN_SECRET` must match `HASURA_GRAPHQL_ADMIN_SECRET` in docker-compose.

## Run Locally

### 1) Start PostgreSQL + Hasura

```powershell
cd back-end\hasura
docker compose up -d
```

Hasura console: `http://localhost:8080/console`

### 2) Start Express API

```powershell
cd back-end\server\express-api
npm install
npm run dev
```

API base URL: `http://localhost:5000`

### 3) Start Frontend

```powershell
cd front-end
npm install
npm run dev
```

Frontend URL: check terminal output (commonly `http://localhost:3000` or configured port)

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

## Database Notes

- Products are sorted by admin-defined `display_order` (then name).
- Ensure `products.display_order` exists:

```sql
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 9999;
```

## Hasura Permission Checklist (customer role)

- `products`: select active products
- `cart_items`: row filter `customer_id = X-Hasura-User-Id`
- `cart_items` select permission has `Allow Aggregations` enabled

If missing, cart count queries can fail (`cart_items_aggregate` errors).

## Useful Commands

### Restart Hasura stack

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
