#!/usr/bin/env bash
# Supabase canary: checks the project is actually serving, restarts it if not.
#
# Free-tier (Nano) Supabase projects can wedge: Postgres stays "running" in
# the dashboard but every query takes 10-40s, so auth and REST time out and
# the app 504s. A project restart clears it. This script is the on-call
# engineer for that: probe, confirm, restart, report.
#
# Required env:
#   SUPABASE_ACCESS_TOKEN  Management API personal access token
#   SUPABASE_PROJECT_REF   e.g. tujsydebjyxpzrgwfwvy
#   SUPABASE_ANON_KEY      anon key, for the end-to-end probe
# Optional:
#   CONFIRM_DELAY_SECONDS  wait between first and second failed probe (default 60)
#   DRY_RUN=1              report what would happen, never restart
#
# Exit codes: 0 healthy, 2 restarted (so CI goes red and notifies), 1 error.

set -euo pipefail

: "${SUPABASE_ACCESS_TOKEN:?missing}"
: "${SUPABASE_PROJECT_REF:?missing}"
: "${SUPABASE_ANON_KEY:?missing}"
CONFIRM_DELAY_SECONDS="${CONFIRM_DELAY_SECONDS:-60}"

API="https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}"
PROJECT_URL="https://${SUPABASE_PROJECT_REF}.supabase.co"
PROBE_TIMEOUT=10

mgmt() {
  curl -sS --max-time 30 -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" "$@"
}

# One probe = the Management API's view AND a real request through the
# gateway. During the Sep 2026 wedge the gateway returned 504 while Postgres
# was technically up, so trusting either alone misses real outages.
probe() {
  local problems=()

  local health
  health=$(mgmt "${API}/health?services=db,auth,rest,pooler" || echo '[]')
  local unhealthy
  unhealthy=$(echo "$health" | jq -r '.[]? | select(.healthy != true) | "\(.name)=\(.status)"' | paste -sd, -)
  [ -n "$unhealthy" ] && problems+=("mgmt:${unhealthy}")

  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time "$PROBE_TIMEOUT" \
    -H "apikey: ${SUPABASE_ANON_KEY}" "${PROJECT_URL}/auth/v1/health" || echo "000")
  [ "$code" != "200" ] && problems+=("auth:${code}")

  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time "$PROBE_TIMEOUT" \
    -H "apikey: ${SUPABASE_ANON_KEY}" -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
    "${PROJECT_URL}/rest/v1/api_categories?select=id&limit=1" || echo "000")
  [ "$code" != "200" ] && problems+=("rest:${code}")

  if [ ${#problems[@]} -eq 0 ]; then
    echo "ok"
  else
    local IFS=' '
    echo "${problems[*]}"
  fi
}

ts() { date -u +%Y-%m-%dT%H:%M:%SZ; }

first=$(probe)
echo "$(ts) probe 1: ${first}"
if [ "$first" = "ok" ]; then
  echo "healthy"
  exit 0
fi

# One bad probe can be a blip; two, a minute apart, is a wedge.
sleep "$CONFIRM_DELAY_SECONDS"
second=$(probe)
echo "$(ts) probe 2: ${second}"
if [ "$second" = "ok" ]; then
  echo "recovered on its own"
  exit 0
fi

# Don't restart a project that's already restarting, paused, or being
# worked on by Supabase. Only kick it when it claims to be up.
status=$(mgmt "${API}" | jq -r '.status // "UNKNOWN"')
echo "$(ts) project status: ${status}"
case "$status" in
  ACTIVE_HEALTHY|ACTIVE_UNHEALTHY) ;;
  *)
    echo "not restarting: status ${status} means a restart is already in flight or the project is paused"
    exit 1
    ;;
esac

if [ "${DRY_RUN:-0}" = "1" ]; then
  echo "DRY_RUN: would restart project ${SUPABASE_PROJECT_REF}"
  exit 2
fi

echo "$(ts) restarting project ${SUPABASE_PROJECT_REF}"
restart_code=$(mgmt -o /dev/null -w '%{http_code}' -X POST "${API}/restart")
echo "$(ts) restart request: HTTP ${restart_code}"
if [ "$restart_code" != "201" ] && [ "$restart_code" != "200" ]; then
  echo "restart request failed"
  exit 1
fi

# Recovery took ~3 minutes when done by hand; give it 5.
for i in $(seq 1 10); do
  sleep 30
  result=$(probe)
  echo "$(ts) post-restart probe ${i}: ${result}"
  if [ "$result" = "ok" ]; then
    echo "RESTARTED_AND_RECOVERED"
    {
      echo "outcome=restarted"
      echo "detail=probes failed (${first}; ${second}), restarted at $(ts), recovered after ${i} checks"
    } >> "${GITHUB_OUTPUT:-/dev/null}"
    exit 2
  fi
done

echo "RESTARTED_BUT_STILL_DOWN"
{
  echo "outcome=still-down"
  echo "detail=probes failed (${first}; ${second}), restarted, still failing after 5 minutes: ${result}"
} >> "${GITHUB_OUTPUT:-/dev/null}"
exit 2
