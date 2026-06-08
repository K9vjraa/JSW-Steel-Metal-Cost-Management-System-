# JSW MCMS Production Deployment & Operations Manual

This operations manual details the deployment topology, security policies, backup models, and logging structures for hosting the JSW Steel Metal Cost Management System (MCMS) inside enterprise production platforms.

---

## 🏗️ 1. Architecture Topology & Network Flow

```mermaid
graph TD
    User([JSW Business Operator]) -->|HTTPS: Port 443| Nginx[Production Nginx Container]
    Nginx -->|Proxy API: Port 4000| API[Node/Express Service]
    API -->|TCP/SSL: Port 5432| DB[(Neon Serverless PostgreSQL)]
    API -->|Real-time Stream| Alerts[Push Notifications System]
```

---

## 🔑 2. Environment Variables & Secure Credentials

A secure `.env` file should be mounted onto your orchestration layer (AWS ECS, Railway, or VPS Docker Compose) at `/app/apps/backend/.env`.

### 🛡️ Production Backend Environment Schema
```ini
# --- Core Server settings ---
PORT=4000
NODE_ENV=production
LOG_LEVEL=info

# --- High-Availability Database ---
# Force secure TLS connections by appending ?sslmode=require
DATABASE_URL="postgresql://mcms_admin:[SECURE_PASS]@neon-postgres-cluster.neon.tech/mcms?sslmode=require&connection_limit=20"

# --- Hardened JWT Security Secrets ---
# Use at least 64-character hex strings generated via 'openssl rand -hex 64'
JWT_ACCESS_SECRET="7a31b46a2de581c7081df983a...[REDACTED]"
JWT_REFRESH_SECRET="bf06798c691350a4bfdf72c3d...[REDACTED]"

ACCESS_TOKEN_TTL="15m"
REFRESH_TOKEN_TTL_DAYS=7

# --- Cors Origins ---
CLIENT_ORIGIN="https://mcms.jsw.in"
```

---

## 🐳 3. Container Orchestration & Rollout

Enterprise deployments utilize our multi-stage production Docker images orchestrated via `docker-compose.yml`:

```bash
# 1. Build and boot production containers in background
docker compose --profile full up --build -d

# 2. Check running processes and ports mapping
docker compose ps

# 3. View live server log output stream
docker compose logs -f api
```

---

## 📈 4. Health Monitoring & Recovery Policy

### 🔍 Built-in Endpoints
- **API Server Check**: `GET /api/health`
  - Response: `{"status":"ok","service":"mcms-api"}`
- **Client Server Check**: `GET /health` (Port 80)
  - Response: `{"status":"ok","service":"mcms-client"}`

### 🚨 Outage Recovery Script
A cron-job executes `/infra/production/health-check.sh` every 5 minutes:
- If a server responds with non-200 or connection drops, the script auto-retries up to 3 times before dispatching alerts to `ops-alerts@jsw.in`.

---

## 📜 5. Centralized Logging & Audit Strategy

1. **Structured JSON Logs**: Express API records system-wide transactions in a standard query structure to support forwarding engines like **Datadog** or **Logstash**.
2. **Container Log Rotating Policy**: Local logs are restricted to 10MB limits capped across 3 rotation slots to avoid filling host storage:
   ```yaml
   logging:
     driver: "json-file"
     options:
       max-size: "10m"
       max-file: "3"
   ```
3. **Database Audit Trails**: Core master modifications (price multiplier tweaks, base slab adjustments, or recipe locks) are captured inside the database ledger (`AuditLog` schema) for strict enterprise verification checks.

---

## 💾 6. Database Disaster Recovery & Backups

Daily incremental backups are handled automatically by `/infra/production/backup.sh`:
- Runs pg_dump on the master database cluster.
- Compresses backups via Gzip to minimize target size.
- Rotates backups, auto-purging old snapshots exceeding **30-day retention policies**.

### Manual Restore Procedure
To restore a snapshot in case of host corruption:
```bash
# 1. Decompress target backup archive
gunzip mcms_prod_20260528_020000.sql.gz

# 2. Re-import database structure and content
psql $DATABASE_URL -f mcms_prod_20260528_020000.sql
```
