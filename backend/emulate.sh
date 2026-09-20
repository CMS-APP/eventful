#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Functions/Hosting emulator running LOCALLY, against PRODUCTION Firestore/Auth (eventful-23690)."
echo "    No Firestore/Auth emulator is running - reads AND writes are real."
echo ""

if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
  # shellcheck disable=SC1091
  source "$HOME/.nvm/nvm.sh"
  nvm use 22 >/dev/null
fi

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

EMULATOR_PORTS=(4000 4400 4500 5001 5050)

kill_stale_ports() {
  local port pids
  for port in "${EMULATOR_PORTS[@]}"; do
    pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    if [[ -n "$pids" ]]; then
      echo "==> Port $port is in use (pid(s): $pids) - killing before starting emulators."
      kill $pids 2>/dev/null || true
    fi
  done
}

kill_stale_ports
sleep 1

cd "$ROOT"
firebase emulators:start --only functions,hosting "$@" 2>&1 | tee emulate.log
