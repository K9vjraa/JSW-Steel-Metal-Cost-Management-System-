#!/usr/bin/env bash
###############################################################################
# JSW MCMS — Production Health Monitoring & Alerts
# Usage: ./health-check.sh
# Cron Schedule: */5 * * * * (Runs every 5 minutes)
###############################################################################

set -euo pipefail

# --- CONFIGURATION ---
API_URL="${API_URL:-http://localhost:4000/api/health}"
CLIENT_URL="${CLIENT_URL:-http://localhost:5173/health}"
ALERT_EMAIL="ops-alerts@jsw.in"
MAX_ATTEMPTS=3
TIMEOUT=5

check_endpoint() {
  local name=$1
  local url=$2
  local attempts=0
  
  echo "🔍 Verifying health of ${name} at ${url}..."
  
  while [ ${attempts} -lt ${MAX_ATTEMPTS} ]; do
    status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time ${TIMEOUT} "${url}" || echo "000")
    
    if [ "${status_code}" == "200" ]; then
      echo "✅ ${name} is operational (HTTP 200)."
      return 0
    fi
    
    attempts=$((attempts+1))
    echo "⚠️ Warning: ${name} responded with ${status_code}. Retrying in 5s (${attempts}/${MAX_ATTEMPTS})..."
    sleep 5
  done
  
  echo "❌ CRITICAL: ${name} health check failed!"
  return 1
}

# --- RUN CHECKS ---
FAILURES=0

if ! check_endpoint "API Service" "${API_URL}"; then
  FAILURES=$((FAILURES+1))
fi

if ! check_endpoint "Frontend Static Web Server" "${CLIENT_URL}"; then
  FAILURES=$((FAILURES+1))
fi

# --- DISPATCH ALERT ON FAILURE ---
if [ ${FAILURES} -gt 0 ]; then
  echo "🚨 Sending alert notification to ${ALERT_EMAIL}..."
  # Example alert email dispatch (requires mailutils configured on system)
  # echo -e "Subject: [CRITICAL JSW MCMS Alert] Production Outage Detected\n\nOutage detected at $(date).\nOne or more services failed health check validations." | mail -s "[CRITICAL JSW MCMS Alert] Outage Detected" ${ALERT_EMAIL}
  exit 1
fi

echo "🎉 All JSW MCMS system components are healthy!"
exit 0
