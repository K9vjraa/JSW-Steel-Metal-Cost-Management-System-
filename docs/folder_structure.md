# JSW MCMS Monorepo Folder Structure

The JSW Metal Cost Management System (MCMS) is organized as a high-performance **npm Workspaces Monorepo**. This structure isolates the concerns of the API server, frontend React SPA, and shared packages, ensuring rapid local building, simplified testing, and flexible deployment models.

---

## 🗂️ Overall Repository Structure

At the root level, the project contains overall workspace configurations, deployment configurations, and two main directories: `apps/` (deployable programs) and `packages/` (shared internal modules).

```text
jsw-mcms/
├── .github/                      # CI/CD Workflows
│   └── workflows/
│       └── ci.yml                # Automatic build, lint, and test runner
├── apps/                         # Deployable Applications
│   ├── backend/                  # Authoritative Costing Express API
│   └── frontend/                 # Interactive React ERP Dashboard Client
├── packages/                     # Shared Monorepo Workspaces
│   ├── config/                   # Shared TSConfig & Prettier settings
│   ├── types/                    # Shared TypeScript interfaces & types
│   ├── ui/                       # Reusable styling & styling primitives
│   └── utils/                    # Shared utility helper methods
├── infra/                        # Self-Hosted VPS/Deployment assets
│   └── nginx.conf                # Nginx proxy mapping & gzip server configuration
├── docker-compose.yml            # Local PostgreSQL db orchestration
├── package.json                  # Workspace definitions & run tasks
├── tsconfig.json                 # Core TypeScript settings
└── README.md                     # Welcome Portal & Developer Map
```

---

## ⚙️ Backend Architecture Layout (`apps/backend`)

The backend is built using Node.js, Express, and Prisma ORM, utilizing a modified **Clean Architecture** pattern to isolate database, business logic, validation, and endpoint routing.

```text
apps/backend/
├── prisma/                       # Database Context & Seed Definitions
│   ├── schema.prisma             # Authorized DB tables, relationships & column limits
│   └── seed.ts                   # Realistic industrial pricing & grade datasets
├── src/                          # Server Source Files
│   ├── config/                   # DB Connection, JWT limits, Winston log definitions
│   ├── controllers/              # Handles incoming requests, maps parameters & passes to services
│   ├── middleware/               # Auth gates, rate-limit logs, RBAC guards, global errors
│   ├── models/                   # Custom domain-level data schemas and structures
│   ├── repositories/             # Accesses the database context directly via Prisma
│   ├── routes/                   # Maps Express server endpoints to controller handles
│   ├── services/                 # Evaluates business rules (costing, calculations, comparison)
│   ├── types/                    # Extended typings, express definitions & session claims
│   ├── utils/                    # Response templates, Decimal precision operations
│   ├── validations/              # Request payload payload schemes via Zod
│   ├── app.ts                    # Express application pipeline setup
│   └── server.ts                 # Starts server & binds to designated PORT
├── tests/                        # Vitest unit and integration suites
└── Dockerfile                    # Multi-stage production Alpine build runner
```

---

## 💻 Frontend Architecture Layout (`apps/frontend`)

The client is a single-page application built on React, TypeScript, and Vite. It utilizes **Zustand** for state, **TanStack Query** for cached requests, and custom styling tokens.

```text
apps/frontend/
├── src/                          # Client Source Files
│   ├── assets/                   # Corporate branding logos & vector images
│   ├── components/               # Small, atomic UI widgets & reusable inputs
│   ├── data/                     # Local diagnostic fallback mock fixtures
│   ├── hooks/                    # Reusable API integrations, calculation bindings
│   ├── layouts/                  # Structural templates (Admin panel, Costing view)
│   ├── pages/                    # Complete interactive views (Login, Matrix, Setup)
│   ├── routes/                   # Navigation paths & Client-Side Guard hooks
│   ├── services/                 # Axios API connector instances with interceptors
│   ├── store/                    # Zustand persistent session state store
│   ├── styles/                   # Modern tailwind styling tokens and layouts
│   ├── types/                    # Frontend schema interfaces
│   ├── utils/                    # Money formatting, comparison color difference tags
│   ├── App.tsx                   # Main router outlet & notification providers
│   └── main.tsx                  # Connects virtual DOM and binds CSS entry points
├── vercel.json                   # Security headers, rewrites & bombay CDN routing
└── nginx.conf                    # Custom VPS reverse proxy specifications
```

---

## 📦 Shared Packages Matrix (`packages/`)

To prevent code duplication, common logic is exported into local packages linked at build time:

1. **`packages/config`**:
   - Contains unified base compiler targets (`tsconfig.json`) shared across both applications to guarantee uniform syntax execution.
2. **`packages/types`**:
   - Shared business interfaces, request/response payloads, validation rules, and error typings.
3. **`packages/ui`**:
   - Polished custom Tailwind design tokens, typography scales, shared components, and layouts.
4. **`packages/utils`**:
   - Shared helper functions including precision rounding algorithms, string generators, and date operations.
