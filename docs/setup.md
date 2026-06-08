# JSW MCMS Developer Setup & Onboarding Guide

Welcome to the **JSW Metal Cost Management System (MCMS)**! This guide will walk you through setting up your local environment, initializing the database, seeding master data, running the test suites, and troubleshooting common issues.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your system:
- **Node.js**: `v22.x` or higher (Active LTS recommended)
- **npm**: `v10.x` or higher
- **PostgreSQL**: `v15.x` or higher (or Docker to run it via the included orchestration files)
- **Git**: For version control management

---

## ⚙️ Initial Project Setup

Follow these steps to download dependencies and prepare compiler contexts:

1. **Clone the repository and install dependencies**:
   ```powershell
   git clone <repo-url>
   cd JSW-Metal-Cost-Management-System
   npm install
   ```

2. **Configure environment variables**:
   Copy the example environment files in the backend workspace:
   ```powershell
   Copy-Item apps/backend/.env.example apps/backend/.env
   ```
   Open `apps/backend/.env` in your editor and configure the secrets. For development, you can point to a local PostgreSQL instance:
   ```env
   DATABASE_URL="postgresql://mcms:mcms@localhost:5432/mcms?schema=public&connection_limit=5"
   JWT_ACCESS_SECRET="dev-access-secret-at-least-32-characters-long"
   JWT_REFRESH_SECRET="dev-refresh-secret-at-least-32-characters-long"
   PORT="4000"
   NODE_ENV="development"
   CLIENT_ORIGIN="http://localhost:5173"
   LOG_LEVEL="debug"
   ```

---

## 🗄️ Database Provisioning & Seeding

1. **Spin up a local PostgreSQL container** (optional, if you do not have local pg running):
   ```powershell
   docker compose up -d db
   ```
   This orchestrates a standard PostgreSQL 16 container bound to port `5432` with username `mcms` and password `mcms`.

2. **Generate the Prisma client code**:
   ```powershell
   npm run prisma:generate
   ```
   This compiles database mappings directly into `@prisma/client` types stored inside your `node_modules`.

3. **Deploy database migrations**:
   ```powershell
   npm run prisma:migrate
   ```
   This synchronizes your local schema with the `prisma/schema.prisma` blueprint and runs the migration history scripts.

4. **Seed the database with industrial datasets**:
   ```powershell
   npm run seed
   ```
   This loads initial master tables with realistic, production-grade pricing, steel grades, non-ferrous metals (**Aluminum**, **Zinc**), supplier rosters, and sample users.

---

## 🚀 Running the Development Servers

To start the API backend and React frontend dev server concurrently:
```powershell
npm run dev
```

- **Frontend client**: `http://localhost:5173/` (mapped to `http://localhost:5174/` if 5173 is in use)
- **Backend API**: `http://localhost:4000/api`

---

## 💡 Frontend Dev Fallback Mode (Diagnostic Mode)

If you are developing or previewing the React interface and **do not** have a PostgreSQL instance running locally:
- The frontend features a **development-only local fixture fallback** (`apps/frontend/src/data/fixtures.ts`).
- When the backend is offline, the client bypasses connection failures and loads high-fidelity static mock views.
- *Note:* Production login and transaction locks require an active backend database instance to verify authorization and snap mathematical results.

### Seeded Demo Accounts (Password: `MCMS@2026`)

| Role | Email | Scope |
| :--- | :--- | :--- |
| **Admin** | `admin@jsw-mcms.local` | Full system access, audit logs, system configurations, and users CRUD. |
| **Procurement** | `procurement@jsw-mcms.local` | Master list management, updating prices, and vendor lists. |
| **Finance** | `finance@jsw-mcms.local` | Formula validation, GST slab controls, and calculations viewing. |
| **Production** | `production@jsw-mcms.local` | Costing calculations, alloy workspace operations, and comparisons. |

---

## 🧪 Testing Suites

Execute automated diagnostics to verify that both applications are functional and bug-free:

```powershell
# Run backend and frontend test suites sequentially
npm run test

# Run Vitest interactively for the backend
npm run test --workspace @jsw-mcms/backend

# Run Vitest interactively for the frontend
npm run test --workspace @jsw-mcms/frontend
```

---

## 🔍 Troubleshooting FAQ

### Q1: Compilation crashes with `Out Of Memory` (OOM) heap allocation error
* **Cause:** Bundling or compiling the entire monorepo concurrently may exceed default Node heap thresholds in restricted resource environments.
* **Solution:** Compile the workspaces individually to isolate memory footprints:
  ```powershell
  npm run build --workspace @jsw-mcms/backend
  npm run build --workspace @jsw-mcms/frontend
  ```

### Q2: Prisma connection timeouts during seeding
* **Cause:** PostgreSQL is offline or running on a port other than `5432`.
* **Solution:** Verify that your local database is active using `docker ps` or pgAdmin, and double-check your `DATABASE_URL` in `apps/backend/.env`.

### Q3: Cannot run TSX scripts due to execution policy errors
* **Cause:** Windows PowerShell blocks execution of downloaded scripts by default.
* **Solution:** Temporarily set execution policy to bypass in your current terminal:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  ```
