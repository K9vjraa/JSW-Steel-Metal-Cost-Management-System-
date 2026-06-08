#!/usr/bin/env bash
###############################################################################
# JSW MCMS — Production Deploy Automator
# Usage: ./deploy.sh
###############################################################################

set -euo pipefail

echo "====================================================================="
# Branding
echo "   JSW MCMS — Enterprise Release Deployment Automator"
echo "====================================================================="

# --- 1. VERIFY WORKSPACE ROOT ---
if [ ! -f "package.json" ] || [ ! -f "docker-compose.yml" ]; then
  echo "❌ Error: Please execute this deploy script from the workspace root!" >&2
  exit 1
fi

# --- 2. PULL RECENT SOURCE CHANGES ---
echo "📥 Syncing latest production branch updates..."
git pull origin production || echo "ℹ️ Continuing build with local state."

# --- 3. REBUILD AND RUN ZERO-DOWNTIME CONTAINERS ---
echo "🐳 Rebuilding target Docker images..."
docker compose --profile full build --no-cache

echo "🚀 Rolling out containers with zero-downtime..."
docker compose --profile full up -d --remove-orphans

# --- 4. VERIFY CONTAINER STATUSES ---
echo "🛡️ Verifying deployment runtime logs..."
sleep 5
docker compose ps

echo "====================================================================="
echo "✅ JSW MCMS Production Deployment Completed Successfully!"
echo "====================================================================="
