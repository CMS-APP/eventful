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

cd "$ROOT"
exec firebase emulators:start --only functions,hosting "$@"
