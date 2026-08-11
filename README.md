# Mini ERP + CRM Operations Portal

This repository contains a full-stack mini ERP/CRM portal for a wholesale and distribution business.

## Tech Stack

- Backend: Node.js, TypeScript, Express.js, Prisma
- Database: PostgreSQL
- Frontend: React, TypeScript, Vite
- Deployment: Render for backend, Netlify for frontend

## Features

- JWT authentication with roles: Admin, Sales, Warehouse, Accounts
- Customer CRM with search, detail view, and follow-up notes
- Product and stock management with stock movement logs
- Sales challans with draft/confirmed workflow and stock validation
- Responsive admin-style UI

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

- `apps/backend/.env`
- `apps/frontend/.env`

3. Create and migrate the database:

```bash
npm run db:generate -w @fundsroom/backend
npm run db:push -w @fundsroom/backend
npm run db:seed -w @fundsroom/backend
```

If you want local PostgreSQL via Docker, run:

```bash
docker compose up -d
```

4. Run both apps:

```bash
npm run dev
```

## Deployment

### Backend on Render

- Build command: `npm install && npm run build -w @fundsroom/backend`
- Start command: `npm run start -w @fundsroom/backend`
- Environment variables:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `CORS_ORIGIN`
  - `PORT`

The backend can also be deployed from `render.yaml`.

### Frontend on Netlify

- Build command: `npm install && npm run build -w @fundsroom/frontend`
- Publish directory: `apps/frontend/dist`
- Environment variables:
  - `VITE_API_URL`

## Test Users

Seeded users are created with password `Password123!` for all roles.

## Assumptions

- PostgreSQL is the production database.
- Challans store product snapshots to preserve pricing and item details at creation time.
- The app is designed to be practical and extensible rather than over-engineered.
- A Postman collection is included in `postman/Fundsroom ERP CRM.postman_collection.json`.# Fundsroom_Rishu
