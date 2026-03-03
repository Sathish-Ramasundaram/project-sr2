# SR Store Project

SR Store is a full-stack learning project with:
- Frontend: React + TypeScript + Redux Toolkit + Redux Saga (`front-end`)
- Backend: Express + TypeScript auth service (`back-end/server/express-api`)
- Data layer: Hasura GraphQL + PostgreSQL (`back-end/hasura`)

## Project Structure

- `front-end/`: customer/admin UI
- `back-end/server/express-api/`: auth + API service
- `back-end/hasura/`: Docker compose for PostgreSQL + Hasura

## Prerequisites

- Node.js 18+
- npm
- Docker Desktop

## Environment Setup

### Backend (`back-end/server/express-api/.env`)

Use:

```env
PORT=5000
JWT_SECRET=change-this-to-a-very-strong-secret
JWT_EXPIRES_IN=7d
HASURA_GRAPHQL_URL=http://localhost:8080/v1/graphql
HASURA_ADMIN_SECRET=myadminsecretkey
HASURA_JWT_DEFAULT_ROLE=customer
HASURA_JWT_ALLOWED_ROLES=customer,admin
```

### Hasura (`back-end/hasura/docker-compose.yml`)

`hasura.environment` must include both admin secret and JWT secret:

```yml
HASURA_GRAPHQL_ADMIN_SECRET: myadminsecretkey
HASURA_GRAPHQL_JWT_SECRET: '{"type":"HS256","key":"change-this-to-a-very-strong-secret","claims_namespace":"https://hasura.io/jwt/claims"}'
```

`key` in `HASURA_GRAPHQL_JWT_SECRET` must match backend `JWT_SECRET`.

## Run the Project

### 1. Start PostgreSQL + Hasura

```powershell
cd C:\Training\Simple\project\project-sr2\back-end\hasura
docker compose up -d
```

Hasura console: `http://localhost:8080/console`

### 2. Start Backend API

```powershell
cd C:\Training\Simple\project\project-sr2\back-end\server\express-api
npm install
npm run dev
```

Backend base URL: `http://localhost:5000`

### 3. Start Frontend

```powershell
cd C:\Training\Simple\project\project-sr2\front-end
npm install
npm run dev
```

## Current Auth Flow

- Frontend calls backend auth APIs:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/forgot`
- Backend validates user/password, then signs JWT with Hasura claims.
- Frontend stores JWT and sends `Authorization: Bearer <token>` to Hasura GraphQL.
- Hasura enforces table permissions by role (`customer`, `admin`) and user id.

## Current Product and Cart Flow

- Home/Catalogue/Product details are read from Hasura `products` table.
- Cart count and add-to-cart are read/write against `cart_items`.
- Queries are now role-based via JWT (no frontend admin-secret fallback).

## Implemented Features (Current)

- Customer auth: register, login, forgot password
- Customer home with live products from Hasura
- Catalogue with category/sort + students section
- Product details from Hasura by product id
- Redux Saga cart flow connected to Hasura
- Theme toggle and shared header component
- Storybook setup for frontend components
- Cypress tests (theme toggle and admin login visual flow)

## Hasura Permissions Notes

At minimum, verify these for `customer` role:
- `products`: select active products
- `cart_items`: row-level filter by `customer_id = X-Hasura-User-Id`
- `cart_items` select permission has **Allow Aggregations** enabled

Without aggregation permission, cart count query can fail with:
`field 'cart_items_aggregate' not found in type: 'query_root'`.

## Useful Commands

### Restart Hasura after config change

```powershell
cd C:\Training\Simple\project\project-sr2\back-end\hasura
docker compose down
docker compose up -d
```

### Type-check frontend

```powershell
cd C:\Training\Simple\project\project-sr2\front-end
npx tsc --noEmit
```

## Production Direction

- Use Hasura/Postgres as source of truth for products and inventory.
- Manage day-to-day products from Admin UI/API (not manual SQL edits).
- Keep migrations + metadata versioned in git.
- Keep strict role permissions and avoid exposing admin secret to frontend.
