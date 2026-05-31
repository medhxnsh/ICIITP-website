#!/usr/bin/env bash
# Starts backend + frontend together. Ctrl-C kills both.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/.."

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  echo ""
  echo "▶ Shutting down..."
  [ -n "$BACKEND_PID" ]  && kill "$BACKEND_PID"  2>/dev/null
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  exit 0
}
trap cleanup INT TERM

echo "▶ Starting backend (port 8080)..."
bash "$SCRIPT_DIR/backend.sh" &
BACKEND_PID=$!

echo "▶ Starting frontend (port 3000)..."
(cd "$ROOT" && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "  Backend  → http://localhost:8080"
echo "  Frontend → http://localhost:3000"
echo "  Press Ctrl-C to stop both."
echo ""

# Poll both processes — bash 3 compatible (no wait -n)
while true; do
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo "✗ Backend exited unexpectedly."
    cleanup
  fi
  if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    echo "✗ Frontend exited unexpectedly."
    cleanup
  fi
  sleep 2
done
