#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/.."
BACKEND="$ROOT/backend"

JAVA_HOME_21="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"

# ── Load central env ─────────────────────────────────────────────────────────
ENV_FILE="$ROOT/config/.env"
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
else
  echo "⚠ config/.env not found — using application.yml defaults"
fi

# ── 1. Ensure PostgreSQL is running ──────────────────────────────────────────
if ! pg_isready -q 2>/dev/null; then
  echo "▶ Starting PostgreSQL (this session only)..."
  brew services run postgresql@14
  sleep 2
fi

# ── 2. Ensure iciitp database and user exist ──────────────────────────────────
ME=$(whoami)
DB_PASS="${DB_PASSWORD:-changeme}"

if psql -U "$ME" -tc "SELECT 1 FROM pg_roles WHERE rolname='iciitp'" postgres | grep -q 1; then
  # User exists — sync password in case config/.env changed
  psql -U "$ME" -c "ALTER USER iciitp WITH PASSWORD '$DB_PASS';" postgres
else
  psql -U "$ME" -c "CREATE USER iciitp WITH PASSWORD '$DB_PASS';" postgres
fi

psql -U "$ME" -tc "SELECT 1 FROM pg_database WHERE datname='iciitp'" postgres | grep -q 1 \
  || { psql -U "$ME" -c "CREATE DATABASE iciitp OWNER iciitp;" postgres
       psql -U "$ME" -c "GRANT ALL PRIVILEGES ON DATABASE iciitp TO iciitp;" postgres; }

# ── 3. Start Spring Boot ──────────────────────────────────────────────────────
echo "▶ Starting backend (port 8080)..."
export JAVA_HOME="$JAVA_HOME_21"
exec mvn -f "$BACKEND/pom.xml" spring-boot:run
