#!/usr/bin/env bash
set -euo pipefail
set -m

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$ROOT/.dev-logs"
mkdir -p "$LOG_DIR"

RUN_MOBILE=1
if [[ "${1:-}" == "--no-mobile" ]]; then
  RUN_MOBILE=0
  shift
fi

PIDS=()

cleanup() {
  trap - EXIT INT TERM
  echo ""
  echo "==> Stopping backend and web..."
  for pid in "${PIDS[@]}"; do
    kill -TERM -- "-$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
  echo "==> Stopped."
}
trap cleanup EXIT INT TERM

free_port() {
  local port="$1" pids
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    echo "==> Port $port in use (pid(s): $pids) - stopping it."
    kill $pids 2>/dev/null || true
  fi
}

wait_for_port() {
  local name="$1" port="$2" pid="$3" log="$4" timeout="$5" waited=0
  printf "==> Waiting for %s on :%s" "$name" "$port"
  until lsof -tiTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; do
    if ! kill -0 "$pid" 2>/dev/null; then
      echo ""
      echo "!! $name exited during startup. Last lines of $log:"
      tail -n 30 "$log"
      exit 1
    fi
    if ((waited >= timeout)); then
      echo ""
      echo "!! $name not up after ${timeout}s. See $log"
      exit 1
    fi
    sleep 1
    waited=$((waited + 1))
    printf "."
  done
  echo " up"
}

for port in 3000 3001 5050; do
  free_port "$port"
done
sleep 1

echo "==> Backend emulator uses PRODUCTION Firestore/Auth (eventful-23690) - writes from the app are real."

(cd "$ROOT/backend" && exec bash ./emulate.sh) >"$LOG_DIR/backend.log" 2>&1 &
PIDS+=($!)
BACKEND_PID=$!

(cd "$ROOT/web" && exec npm run dev) >"$LOG_DIR/web.log" 2>&1 &
PIDS+=($!)
WEB_PID=$!

wait_for_port "backend" 5050 "$BACKEND_PID" "$LOG_DIR/backend.log" 180
wait_for_port "web" 3000 "$WEB_PID" "$LOG_DIR/web.log" 60

if command -v adb >/dev/null 2>&1 && adb get-state >/dev/null 2>&1; then
  adb reverse tcp:5050 tcp:5050 >/dev/null && echo "==> Android device: forwarded :5050 to this Mac"
fi

echo ""
echo "    Backend   http://localhost:5050   (emulator UI http://localhost:4000)"
echo "    Web       http://localhost:3000"
echo "    Logs      tail -f .dev-logs/backend.log .dev-logs/web.log"
echo ""

if ((RUN_MOBILE)); then
  echo "==> Starting Metro (Ctrl+C stops everything)"
  cd "$ROOT/mobile"
  npx expo start "$@"
else
  echo "==> Running backend + web only (Ctrl+C stops both)"
  wait
fi
