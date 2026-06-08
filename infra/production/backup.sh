#!/usr/bin/env bash
###############################################################################
# JSW MCMS — Production Database Backup Strategy
# Usage: ./backup.sh
# Cron Schedule: 0 2 * * * (Runs daily at 2:00 AM)
###############################################################################

set -euo pipefail

# --- 1. CONFIGURATION ---
BACKUP_DIR="/var/backups/mcms"
RETENTION_DAYS=30
DATE_TAG=$(date +"%Y%m%d_%H%M%S")
FILE_NAME="mcms_prod_${DATE_TAG}.sql.gz"
OUTPUT_PATH="${BACKUP_DIR}/${FILE_NAME}"

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

echo "🚀 [$(date)] Starting JSW MCMS Production Database Backup..."

# --- 2. VALIDATE DATABASE URL ---
if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not defined!" >&2
  exit 1
fi

# --- 3. EXECUTE PG_DUMP & GZIP ---
echo "📦 Dumping schema and records..."
if pg_dump "${DATABASE_URL}" | gzip -c > "${OUTPUT_PATH}"; then
  echo "✅ Backup successfully created: ${OUTPUT_PATH}"
  chmod 600 "${OUTPUT_PATH}"
  ls -lh "${OUTPUT_PATH}"
else
  echo "❌ Error: pg_dump execution failed!" >&2
  exit 1
fi

# --- 4. CLEANUP OLD BACKUPS (RETENTION) ---
echo "🗑️ Purging backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "mcms_prod_*.sql.gz" -mtime +"${RETENTION_DAYS}" -exec rm -v {} \;

echo "🎉 [$(date)] Backup rotation and cleanup successfully complete!"
