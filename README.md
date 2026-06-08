# JSW Metal Cost Management System (MCMS)

[![CI/CD Pipelines](https://img.shields.io/badge/CI%2FCD-Active-blue.svg?style=flat-square&color=003366)](.github/workflows/ci.yml)
[![Build Status](https://img.shields.io/badge/Build-Passing-green.svg?style=flat-square)](https://github.com/jsw-steel/mcms)
[![Test Coverage](https://img.shields.io/badge/Tests-5%2F5%20Passed-brightgreen.svg?style=flat-square)](docs/setup.md#testing-suites)
[![Node Version](https://img.shields.io/badge/Node-v22.x-brightgreen.svg?style=flat-square&color=green)](package.json)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2FNeon-blue.svg?style=flat-square&color=0080FF)](apps/backend/prisma/schema.prisma)

JSW Metal Cost Management System (MCMS) is a focused, enterprise-grade costing and matrix comparison platform built for JSW Steel. It centralizes master-locked metal pricing, alloy cost modeling, comparison matrices, transaction logging, and auditable role-based access to safeguard and optimize raw material estimates.

---

## 📘 Enterprise Engineering Documentation Suite

To onboard new developers, review architectural decisions, or check production deployment checklists, consult our dedicated guides:

| Guide / Specification | Scope & Core Focus | File Path |
| :--- | :--- | :--- |
| **🚀 Developer Setup Guide** | Local workspace installation, database seeding, test runners, and troubleshooting. | [docs/setup.md](docs/setup.md) |
| **🗂️ Workspace Directory Map** | Full folder layout and component responsibilities for the monorepo. | [docs/folder_structure.md](docs/folder_structure.md) |
| **🧮 System Architecture Spec** | Clean architecture layers, data flows, precision costing math formulas, and JSON snapshots. | [docs/architecture.md](docs/architecture.md) |
| **🔌 API Endpoint Registry** | Stateless JWT authentication, master CRUD payloads, calculations preview, and real-time SSE stream events. | [docs/api.md](docs/api.md) |
| **🔒 Role Authorization Matrix** | Definitions and access rights for the four system roles (Admin, Procurement, Finance, Production). | [docs/rbac.md](docs/rbac.md) |
| **☁️ Deployment & Hosting Spec** | Container profiles, Vercel security headers, Railway multi-stage builds, and Nginx proxy rules. | [docs/deployment.md](docs/deployment.md) |

---

## ⚡ Quick Start (Local Development)

If you have already installed the prerequisites (Node.js 22, Git, and PostgreSQL/Docker), launch the local environment in five steps:

1. **Install workspace dependencies**:
   ```powershell
   npm install
   ```

2. **Initialize Environment Configuration**:
   ```powershell
   Copy-Item apps/backend/.env.example apps/backend/.env
   ```

3. **Spin up local PostgreSQL Database**:
   ```powershell
   docker compose up -d db
   ```

4. **Deploy database schemas & seed industrial master data**:
   ```powershell
   npm run prisma:generate
   npm run prisma:migrate
   npm run seed
   ```

5. **Fire up development workspace**:
   ```powershell
   npm run dev
   ```

*   **Client Interface**: `http://localhost:5173/`
*   **API Base**: `http://localhost:4000/api`

> [!NOTE]
> **Diagnostic Mode (Backend Offline)**: The React client features an automatic local fixture fallback. If you run the frontend without starting the database, it will automatically load realistic static dashboard views for visual evaluation.

---

## 👥 Default Seeded Accounts (Password: `MCMS@2026`)

| Role | Email Account | System Clearance |
| :--- | :--- | :--- |
| **Admin** | `admin@jsw-mcms.local` | Audit logs, server configurations, and user accounts management. |
| **Procurement** | `procurement@jsw-mcms.local` | Master metals, steel grades, suppliers, and unit pricing records. |
| **Finance** | `finance@jsw-mcms.local` | Tax rates, system settings, and completed calculations audits. |
| **Production** | `production@jsw-mcms.local` | Costing worksheets, alloy structures, and comparison matrices. |

---

## 🧮 Costing Calculation Business Rule

All calculations are evaluated using high-precision Decimal math to prevent floating-point rounding errors:

$$\text{ItemBaseCost} = (\text{Quantity} \times \text{LockedUnitPrice} \times \text{GradeMultiplier}) + \text{GradeExtraFee}$$

For a detailed breakdown of formulas, snapshots, and index optimizations, read the [System Architecture Guide](docs/architecture.md).

---

## 🧪 Comprehensive Verification Sweep

To run unit and integration tests across all workspaces:
```powershell
npm run test
```

To compile production bundles for both services:
```powershell
# Compiles backend TypeScript to JS dist
npm run build --workspace @jsw-mcms/backend

# Compiles and bundles client assets via Vite
npm run build --workspace @jsw-mcms/frontend
```
