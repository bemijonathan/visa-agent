#!/usr/bin/env bash
set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RESET='\033[0m'

ROOT="$(cd "$(dirname "$0")" && pwd)"

log() { echo -e "${CYAN}[dev]${RESET} $*"; }
err() { echo -e "${RED}[dev]${RESET} $*" >&2; }

# Track child PIDs for cleanup
PIDS=()

cleanup() {
  echo ""
  log "Shutting down..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
  log "Done."
}
trap cleanup INT TERM EXIT

# Prefix output from each process with a colored label
prefix_output() {
  local label="$1"
  local color="$2"
  while IFS= read -r line; do
    echo -e "${color}[${label}]${RESET} ${line}"
  done
}

# --- Pre-flight checks ---

if ! command -v bun &>/dev/null; then
  err "bun is not installed. Install it from https://bun.sh"
  exit 1
fi

if ! command -v docker &>/dev/null; then
  err "docker is not installed. Install Docker Desktop from https://docker.com"
  exit 1
fi

# --- Check .env files ---

for envfile in backend extension dashboard; do
  if [[ ! -f "$ROOT/$envfile/.env" ]]; then
    err "Missing $envfile/.env — copy from $envfile/.env.example and fill in values"
    exit 1
  fi
done

# --- Start Docker services ---

log "Starting Docker services (PostgreSQL)..."
docker compose -f "$ROOT/docker-compose.yml" up -d postgres 2>&1 | prefix_output "docker" "$YELLOW"

log "Waiting for PostgreSQL to be ready..."
for i in {1..20}; do
  if docker compose -f "$ROOT/docker-compose.yml" exec -T postgres pg_isready -U visa_agent &>/dev/null; then
    break
  fi
  if [[ $i -eq 20 ]]; then
    err "PostgreSQL did not become ready in time"
    exit 1
  fi
  sleep 1
done
log "${GREEN}PostgreSQL is ready${RESET}"

# --- Install deps if node_modules missing ---

for pkg in backend extension dashboard; do
  if [[ ! -d "$ROOT/$pkg/node_modules" ]]; then
    log "Installing $pkg dependencies..."
    (cd "$ROOT/$pkg" && bun install) 2>&1 | prefix_output "$pkg" "$BLUE"
  fi
done

# --- Push DB schema ---

log "Pushing database schema..."
(cd "$ROOT/backend" && bun run db:push) 2>&1 | prefix_output "prisma" "$YELLOW"

# --- Start services ---

log "Starting backend (port 3001, hot reload)..."
(cd "$ROOT/backend" && bun run dev) 2>&1 | prefix_output "backend" "$GREEN" &
PIDS+=($!)

log "Starting dashboard (port 5173, hot reload)..."
(cd "$ROOT/dashboard" && bun run dev) 2>&1 | prefix_output "dashboard" "$BLUE" &
PIDS+=($!)

log "Starting extension (Vite watch mode)..."
(cd "$ROOT/extension" && bun run dev) 2>&1 | prefix_output "extension" "$CYAN" &
PIDS+=($!)

echo ""
echo -e "${GREEN}All services started.${RESET}"
echo -e "  ${CYAN}Backend:${RESET}    http://localhost:3001"
echo -e "  ${CYAN}Dashboard:${RESET}  http://localhost:5173"
echo -e "  ${CYAN}Extension:${RESET}  Load dist/ from chrome://extensions (Vite rebuilds on save)"
echo ""
echo -e "Press ${YELLOW}Ctrl+C${RESET} to stop all services."
echo ""

# Wait for all children
wait
