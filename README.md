# Fundsroom ERP + CRM

Fundsroom is a full-stack ERP and CRM portal for an Indian wholesale and distribution workflow. It is built to feel practical, fast, and human rather than template-like: customer follow-ups, stock control, GST-friendly records, and challan confirmation all live in one place.

## Live stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript + Prisma
- Database: PostgreSQL on Render
- Hosting: Netlify frontend, Render backend

## Live URLs

- Backend API: https://fundsroom-rishu.onrender.com
- Frontend: add the deployed Netlify URL in your team notes after publish

## What the portal does

- Authenticates Admin, Sales, Warehouse, and Accounts users with JWT
- Manages customers, notes, follow-up dates, and business details
- Tracks products, stock levels, low-stock alerts, and warehouse location
- Creates sales challans in draft or confirmed state
- Reduces stock only when challans are confirmed
- Stores challan snapshots so historical pricing stays accurate

## Design direction

- Warm Indian market-inspired palette with indigo, saffron, and sand tones
- Layout written to feel like a real internal tool, not a default admin dashboard
- Copy tuned for wholesalers, distributors, and warehouse teams

## How to run locally

1. Install dependencies.

```bash
npm install
```

2. Start the apps.

```bash
npm run dev
```

The frontend is configured to use the Render backend by default, so it reads real database data instead of local mocks.

## Environment variables

### Backend

- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `PORT`

### Frontend

- `VITE_API_URL=https://fundsroom-rishu.onrender.com`
- `VITE_USE_MOCKS=false`

## Deployment notes

### Render backend

- Build command: `npm install && npm run build -w @fundsroom/backend`
- Start command: `npm start`
- The root `start` script pushes the Prisma schema, seeds initial data if needed, and then starts the backend service.
- CORS allows localhost, Netlify, and Render origins.

### Netlify frontend

- Build command: `npm install && npm run build -w @fundsroom/frontend`
- Publish directory: `apps/frontend/dist`
- SPA routing is configured in `netlify.toml`

## Seeded login accounts

All demo users use `Password123!`.

- `admin@fundsroom.local`
- `sales@fundsroom.local`
- `warehouse@fundsroom.local`
- `accounts@fundsroom.local`

## Notes

- PostgreSQL is the production database.
- Challans store product snapshots to preserve history.
- A Postman collection is available in `postman/Fundsroom ERP CRM.postman_collection.json`.
# Fundsroom_Rishu
