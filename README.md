# Fundsroom ERP + CRM

> **Production v1.0 — Indian Market Focused** | React · Node · PostgreSQL
> Full-Stack Wholesale & Distribution Management Platform

Fundsroom is a full-stack Enterprise Resource Planning (ERP) and Customer Relationship Management (CRM) portal custom-engineered for modern Indian wholesale and distribution workflows. The portal unifies customer relationship follow-ups, inventory and stock management, GST-compliant transactions, and sales delivery challans into a cohesive, high-performance web interface.

---

## 🔗 Live Deployment Links

| Resource | URL |
|---|---|
| **Live Frontend App** | [`https://fundsroom-erp.netlify.app`](https://fundsroom-erp.netlify.app) |
| **Backend API Base URL** | [`https://fundsroom-rishu.onrender.com`](https://fundsroom-rishu.onrender.com) |
| **GitHub Repository** | [`https://github.com/rishu-fundsroom/fundsroom-erp-crm`](https://github.com/rishu-fundsroom/fundsroom-erp-crm) |
| **Postman Collection** | `docs/Fundsroom_API.postman_collection.json` |

---

## 🏗️ Technical Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM |
| **Database** | PostgreSQL (Render Managed DB) |
| **Cloud Storage** | AWS S3 (Product assets & images via CDN URLs) |
| **Authentication** | Role-Based Access Control (RBAC) via JWT |
| **PDF / Invoices** | Server-side PDF snapshot renderer (GST-ready) |
| **CI/CD** | GitHub Actions → Render + Netlify |
| **Containerization** | Docker + Docker Compose |

---

## ✅ Core Platform Capabilities & Feature Checklist

| # | Module | Description | Status |
|---|---|---|---|
| 1 | Docker Setup | Containerized multi-stage Dockerfile for Backend and Nginx-based frontend container with Docker Compose orchestration. | ✅ Completed |
| 2 | GitHub Actions CI/CD | Automated pipeline triggering tests, Prisma migration checks, and seamless auto-deploys to Render & Netlify. | ✅ Completed |
| 3 | Export Invoice / Challan as PDF | Generates downloadable GST-ready Tax Invoices and Delivery Challans with snapshot pricing and auto-computed tax breakdown. | ✅ Completed |
| 4 | Product Image S3 Upload | Direct secure multipart upload pipeline to AWS S3 bucket with auto-generated public CDN URLs for product catalogs. | ✅ Completed |
| 5 | Monorepo Architecture | Workspace-structured monorepo with `@fundsroom/frontend` and `@fundsroom/backend` packages. | ✅ Verified |
| 6 | Live Frontend URL | Deploys on Netlify edge CDN connected directly to the production Render API endpoint. | ✅ Live |
| 7 | Live Backend API URL | Node.js API running live on Render platform connected to PostgreSQL cluster. | ✅ Live |
| 8 | Test Credentials (All 4 Roles) | Pre-configured system users for testing Admin, Sales, Warehouse, and Accounts workflows. | ✅ Active |
| 9 | Postman / API Collection | Complete OpenAPI / Postman v2.1 collection exported for endpoint verification and external integration. | ✅ Provided |
| 10 | README & Setup Guide | Exhaustive local execution, environment setup, and deployment documentation. | ✅ Included |
| 11 | Architecture Overview | Decoupled Client-Server architecture utilizing Prisma ORM, stateful JWT, and transactional SQL isolation. | ✅ Detailed |
| 12 | Known Limitations & Roadmap | Clear disclosure of scope, pending offline-sync features, and future roadmap items. | ✅ Documented |

---

## 🔐 Test Login Credentials — Role-Based Access (RBAC)

The portal enforces strict **Role-Based Access Control**. Each role sees only the modules relevant to its workflow.

| User Role | Email Address | Password | Access Privileges & Responsibilities |
|---|---|---|---|
| **Super Admin** | `admin@fundsroom.com` | `Admin@12345` | Full system access, user management, audit logs, system configuration, global reporting. |
| **Sales Executive** | `sales@fundsroom.com` | `Sales@12345` | Customer CRM, meeting notes, creating draft sales challans, follow-up calendar. |
| **Warehouse Manager** | `warehouse@fundsroom.com` | `Warehouse@12345` | Stock tracking, warehouse location updating, low-stock alerts, confirming challans and dispatch. |
| **Accounts Officer** | `accounts@fundsroom.com` | `Accounts@12345` | Invoice generation, GST calculation snapshots, payment receipt logging, ledger views. |

> **Seeded demo accounts** for quick local testing (all share password `Password123!`):
> `admin@fundsroom.local` · `sales@fundsroom.local` · `warehouse@fundsroom.local` · `accounts@fundsroom.local`

---

## ⚙️ Architecture & Workflow Design

### Transactional Inventory & Challan Logic — Two-Phase Model

In wholesale distribution, stock reservation must be explicitly decoupled from draft orders. Fundsroom implements a two-phase transaction model backed by atomic PostgreSQL transactions:

1. **Draft Challan Creation** — Sales representatives assemble orders for customers. Pricing and tax items are captured, but **inventory stock balances remain unaffected**.

2. **Challan Confirmation & Inventory Reduction** — Upon approval from the warehouse or accounts team, the status transitions to `CONFIRMED`. An atomic Prisma transaction (`prisma.$transaction`) immediately:
   - Locks the inventory row
   - Verifies stock availability
   - Deducts the precise item quantities
   - Creates a historical price snapshot (so future catalog price changes never retroactively alter issued challans)

3. **GST & PDF Invoice Generation** — The pricing snapshot stored in `ChallanItem` ensures that subsequent catalog price revisions **never alter already confirmed invoices or legal tax receipts**. Legal copies are exported as PDF.

### User Interface Philosophy

Unlike sterile, generic administrative templates, Fundsroom is styled with a **warm Indian market-inspired color palette**:

- Deep indigos (`#1e3a8a`) — primary trust color for sidebar and brand
- Rich saffron accents (`#f59e0b`) — highlights, CTAs, and Indian brand identity
- Soft sand undertones — for approachable card surfaces
- High-density readable typography tuned for the desks of wholesalers, distributors, and warehouse staff
- Micro-copy phrased naturally for Hindi/English code-mixed users (no stiff enterprise jargon)
- Optimized for rapid keyboard navigation and data entry

---

## 💻 Local Development & Installation

### Prerequisites
- Node.js **20+**
- PostgreSQL **14+** (local or Render-connection string works)
- npm / pnpm (repo uses npm workspaces)

### Step 1 — Install Dependencies

```bash
# Installs for both @fundsroom/frontend and @fundsroom/backend
npm install
```

### Step 2 — Configure Environment Variables

Create `.env` files based on the templates below.

#### Backend (`apps/backend/.env`)
```env
DATABASE_URL="postgresql://user:pass@host:5432/fundsroom"
JWT_SECRET="super-secret-jwt-key-32-chars-minimum-change-me"
CORS_ORIGIN="http://localhost:5173"
PORT=5000

# Optional — S3 product uploads
AWS_S3_BUCKET="fundsroom-assets"
AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="AKIAXXXXXXXXXXXXXXXX"
AWS_SECRET_ACCESS_KEY="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

#### Frontend (`apps/frontend/.env`)
```env
VITE_API_URL="https://fundsroom-rishu.onrender.com"
VITE_USE_MOCKS=false
VITE_ENABLE_S3_UPLOADS=true
VITE_APP_TITLE="Fundsroom ERP"
```

### Step 3 — Database Setup & Run

```bash
# Initialise the database schema via Prisma
npx prisma migrate dev --name init

# Start backend (port 5000) + frontend (port 5173) in parallel
npm run dev
```

Open [`http://localhost:5173`](http://localhost:5173) and sign in with any demo account.

---

## 🐳 Docker & CI/CD Deployment Architecture

### Multi-Stage Dockerfile — Backend Service

```dockerfile
# ===== BUILDER =====
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
RUN npm ci
COPY . .
RUN npm run build -w @fundsroom/backend

# ===== RUNNER =====
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/backend/package.json ./
EXPOSE 5000
CMD ["node", "dist/index.js"]
```

### GitHub Actions Workflow (`.github/workflows/deploy.yml`)

Triggers on every push to `main`:

```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [ main ]

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - name: Trigger Render Backend Deploy
        run: curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK_URL }}"
      - name: Trigger Netlify Frontend Deploy
        run: curl -X POST "${{ secrets.NETLIFY_BUILD_HOOK_URL }}"
```

Configure the following **Repository Secrets** in GitHub → Settings → Secrets and variables → Actions:
- `RENDER_DEPLOY_HOOK_URL` — from Render Dashboard → Web Service → Deploy Hook
- `NETLIFY_BUILD_HOOK_URL` — from Netlify → Site → Deploys → Deploy Settings → Build hooks

---

## 📡 API Endpoint Specification (Postman)

The full **Postman v2.1 collection** lives in the repo at:
```
docs/Fundsroom_API.postman_collection.json
```
Import that file into Postman for a ready-to-run request suite.

### Key Endpoints

| Method | Path | Auth (JWT role) | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | None | Authenticates user credentials and issues JWT. |
| `GET`  | `/api/v1/customers` | Sales / Admin | Paginated customer list with follow-up metadata. |
| `POST` | `/api/v1/products/upload-image` | Admin / Warehouse | Generates AWS S3 pre-signed upload URL for product media. |
| `POST` | `/api/v1/challans` | Sales / Admin | Creates a **DRAFT** sales challan — no stock deduction. |
| `POST` | `/api/v1/challans/:id/confirm` | Warehouse / Admin | **Locks inventory, reduces stock balances, and generates the immutable price snapshot.** |
| `GET`  | `/api/v1/invoices/:id/pdf` | Accounts / Admin | Streams a dynamic PDF invoice for direct download. |

---

## 🚢 Production Deployment

### Render — Backend Service

| Setting | Value |
|---|---|
| Build Command | `npm install && npm run build -w @fundsroom/backend` |
| Start Command | `npm start` |
| Root Directory | `apps/backend` (or leave empty — monorepo scripts resolve correctly) |
| Required Env Vars | `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `PORT=10000` |
| Optional Env Vars | `AWS_S3_BUCKET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |

> ℹ️ The root `start` script boots Node. On startup, the backend automatically:
> 1. Loads env vars (dotenv/config in-process so Prisma inherits)
> 2. Runs `prisma db push --skip-generate` if tables don't exist yet
> 3. Seeds demo users + sample customer + sample product safely (upsert/skip)
> 4. Starts the Express server listening on the Render-assigned `$PORT`

### Netlify — Frontend App

| Setting | Value |
|---|---|
| Build Command | `npm install && npm run build -w @fundsroom/frontend` |
| Publish Directory | `apps/frontend/dist` |
| Build Environment | `VITE_API_URL=https://fundsroom-rishu.onrender.com` |
| Routing | `netlify.toml` SPA rewrites are configured for deep links |

---

## 🧭 Known Limitations & Roadmap

| Item | Status / Plan |
|---|---|
| **Offline Sync** | Currently requires active internet connectivity for Render backend. Progressive Web App (PWA) offline queue is planned for **v1.2**. |
| **Bulk Excel Import** | Product catalog bulk import via `.xlsx` files is currently processed asynchronously; real-time progress indicators are under active enhancement. |
| **E-Way Bill Direct Integration** | GST E-Way bill generation currently produces fully compliant data payloads for manual entry into the e-Way Bill Portal; direct NIC-GSTN API integration is scoped for **v1.1**. |
| **Mobile App** | PWA wrapper on roadmap for warehouse-scanner workflows. |
| **GSTR-1 / GSTR-3B Export** | Structured GST return `.json` and `.csv` exports for direct filing — scheduled for **v1.1**. |

---

## 📁 Monorepo Layout

```
Fundsroom/
├── apps/
│   ├── frontend/          # @fundsroom/frontend — Vite + React 18
│   │   ├── src/
│   │   │   ├── components/  # Sidebar · StatCard · Forms · Tables
│   │   │   ├── pages/       # Login · Dashboard · Customers · Products · Challans
│   │   │   ├── context/     # AuthContext (JWT, role guards)
│   │   │   └── styles/      # global.css (design system · tokens · layout primitives)
│   │   └── netlify.toml
│   └── backend/           # @fundsroom/backend — Express + Prisma
│       ├── prisma/
│       │   ├── schema.prisma   # PostgreSQL data model + enums
│       │   ├── prisma.config.ts
│       │   └── seed.ts         # Safe idempotent seed (ensure-X helpers)
│       └── src/
│           ├── index.ts        # Boot script
│           ├── lib/bootstrap.ts # db push + seed orchestration
│           ├── routes/         # auth · customers · products · challans · invoices
│           └── middleware/     # JWT auth · RBAC guards · error handlers
├── docs/
│   └── Fundsroom_API.postman_collection.json
├── package.json           # npm workspaces root
├── Dockerfile
├── docker-compose.yml
└── README.md              # ← you are here
```

---

<div align="center">
  <strong>Fundsroom ERP + CRM — Built for Indian distributors. Ship challans, not surprises.</strong>
  <br />
  <sub>Production v1.0 · © Fundsroom</sub>
</div>
