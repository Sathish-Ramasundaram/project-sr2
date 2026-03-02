# SR Store Project

SR Store is a full-stack practice project with:
- Frontend: React + TypeScript (`front-end`)
- Backend: Express + TypeScript (`back-end/server/express-api`)

## Project Structure

- `front-end/`: customer/admin UI
- `back-end/server/express-api/`: API service
- `back-end/hasura/`: reserved for Hasura-related setup

## Prerequisites

- Node.js 18+
- npm

## Run the Project

### 1. Start Backend API

```powershell
cd C:\Training\Simple\project\project-sr2\back-end\server\express-api
npm install
npm run dev
```

Backend runs at: `http://localhost:5000`

### 2. Start Frontend

```powershell
cd C:\Training\Simple\project\project-sr2\front-end
npm install
npm run dev
```

Frontend runs on the dev server URL shown in terminal.

## Implemented Features

- Home page with navigation
- Catalogue page
  - Product list from backend API
  - Category + sort filters using backend query params
- Product details page
  - Uses `GET /api/products/:id`
- FAQ page
  - Submit question (`POST /api/faqs`)
  - List questions (`GET /api/faqs`)
- Students section in catalogue
  - Uses `GET /api/catalogue/students`

## Backend API Endpoints

- `GET /` - API health
- `GET /api/products` - product list (supports query params)
  - `category` (example: `Dairy`)
  - `sort` (`low-to-high`, `high-to-low`)
- `GET /api/products/:id` - product details by id
- `GET /api/catalogue/students` - students section data
- `GET /api/faqs` - list FAQ questions
- `POST /api/faqs` - create FAQ question
- `GET /api/error-test` - test centralized error handling

## Express Concepts Covered

- Routing: `GET`, `POST`, route params
- Middleware: global logger, CORS, fallback middleware
- Request handling: `req.body`, `req.params`, `req.query`
- Response handling: `res.json`, `res.status`, headers
- 404 fallback middleware
- Centralized error-handling middleware

## Notes

- Product data source is backend API (single source of truth).
- Frontend static product master data has been removed.
