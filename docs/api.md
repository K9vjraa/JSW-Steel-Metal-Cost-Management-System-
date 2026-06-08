# JSW MCMS API Specification

This document serves as the authoritative reference for the JSW Metal Cost Management System (MCMS) backend REST API and Server-Sent Events (SSE) notification streams.

---

## 🔒 Security & Authentication Flow

The API enforces stateless authentication via secure **JSON Web Tokens (JWT)** combined with secure, rotating, `HttpOnly` **Refresh Tokens** stored as cookies.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client Web App
    participant API as Express API Server
    database DB as PostgreSQL DB
    
    Client->>API: POST /api/auth/login (email, password)
    API->>DB: Validates credentials & fetches role
    DB-->>API: User details match
    API->>DB: Generates refresh token & stores hash
    API-->>Client: Returns accessToken (JWT payload) & HttpOnly Cookie (refreshToken)
    
    Note over Client: Client uses accessToken in Authorization Header
    Client->>API: GET /api/auth/me (Authorization: Bearer <token>)
    API-->>Client: Returns active user profile & claims
```

### 1. Endpoint Registry

#### `POST /api/auth/login`
- **Description**: Authenticates user and initializes session.
- **Request Body**:
  ```json
  {
    "email": "production@jsw-mcms.local",
    "password": "MCMS@2026"
  }
  ```
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "u-9912-32a8-12",
      "name": "Production Engineer",
      "email": "production@jsw-mcms.local",
      "role": "PRODUCTION",
      "department": "Costing Workspace"
    }
  }
  ```
- **Cookie Set**: `refreshToken` (Secure, HttpOnly, SameSite=Strict, path=/api/auth).

#### `POST /api/auth/refresh`
- **Description**: Rotates the current refresh token cookie and issues a brand new short-lived access token.
- **Response Payload (`200 OK`)**: Same as login.
- **Cookie Set**: Brand new rotated `refreshToken` cookie.

#### `POST /api/auth/logout`
- **Description**: Revokes the current session and clears the refresh cookie.
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Session successfully terminated."
  }
  ```

---

## 📊 Dashboard Data API

Provides the compiled data analytics and aggregated KPI matrices for both administrator and production dashboards.

#### `GET /api/dashboard/admin`
- **Headers**: `Authorization: Bearer <AdminAccessToken>`
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "kpis": {
        "totalCalculations": 1420,
        "completedCalculations": 1180,
        "activeUsers": 24,
        "priceRevisionsThisMonth": 18
      },
      "activeSystemAlerts": [
        { "id": "1", "message": "High priority metal price mismatch detected on Supplier S-102", "priority": "HIGH" }
      ],
      "recentAuditLogs": [
        { "id": "aud-102", "action": "PRICE_UPDATE", "user": "procurement@jsw-mcms.local", "timestamp": "2026-05-29T11:00:00Z" }
      ]
    }
  }
  ```

---

## 🏗️ Master Tables CRUD API

Provides search, filter, and pagination support for Metals, Grades, Raw Materials, Alloys, and Suppliers.

#### `GET /api/metals`
- **Parameters**:
  - `page`: Page index (default: `1`)
  - `limit`: Records per page (default: `20`)
  - `search`: Filter results by code or name (e.g. `?search=steel`)
  - `category`: Filter by category (`?category=Ferrous`)
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "met-102-392",
        "name": "Stainless Steel",
        "code": "SS-304",
        "category": "Ferrous",
        "unit": "kg",
        "status": "ACTIVE"
      }
    ],
    "meta": {
      "currentPage": 1,
      "totalPages": 1,
      "totalRecords": 1
    }
  }
  ```

---

## 🧮 Calculations & Costing Engine

The primary core transactions boundary of the MCMS costing workspace.

#### `POST /api/calculations/preview`
- **Description**: Evaluates items and computes the complete cost structure in memory, returning formulas and totals without committing changes to PostgreSQL.
- **Request Body**:
  ```json
  {
    "mode": "MULTI_METAL",
    "name": "Stainless Slab Batch 2",
    "items": [
      {
        "metalId": "met-102-392",
        "gradeId": "grd-302-21",
        "quantity": 1000.00,
        "extraPrice": 500.00
      }
    ],
    "gstSlabId": "gst-18-pct"
  }
  ```
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "preview": {
      "totalQuantity": 1000.00,
      "baseCost": 25500.00,
      "gstAmount": 4590.00,
      "finalCost": 30090.00,
      "items": [
        {
          "itemName": "Stainless Steel - SS-304",
          "quantity": 1000.00,
          "unitPrice": 23.80,
          "gradeMultiplier": 1.0500,
          "extraPrice": 500.00,
          "baseCost": 25500.00
        }
      ]
    }
  }
  ```

#### `POST /api/calculations`
- **Description**: Creates a new calculation with `DRAFT` status.
- **Request Body**: Same as preview.
- **Response Payload (`201 Created`)**: Returns the saved calculation containing a unique generated `batchId`.

#### `POST /api/calculations/:id/complete`
- **Description**: Validates, computes the final mathematical formula, compiles locked JSON snapshots of grades and supplier prices, and changes status to `COMPLETED`. Bypasses live updates thereafter.

---

## 📡 Live Notifications SSE Stream

Establishes a real-time event pipeline using Server-Sent Events (SSE).

#### `GET /api/notifications/stream/live`
- **Headers**:
  - `Accept: text/event-stream`
  - `Authorization: Bearer <accessToken>`
- **Connection Keep-Alive**: Returns chunked JSON streams whenever price lists are modified or audit logs report authentication violations.
  ```text
  event: message
  data: { "id": "not-19", "title": "Price Update", "message": "Aluminum price updated by Procurement Specialist", "priority": "MEDIUM" }
  ```

---

## 📤 Document Export API

Enforces PDF creation and spreadsheet download mappings.

- **`GET /api/exports/calculations/:id/pdf`**: Returns a binary PDF cost invoice compiled with PDFKit.
- **`GET /api/exports/reports/excel?startDate=2026-01-01&endDate=2026-05-29`**: Downloads an Excel sheet built with ExcelJS.
