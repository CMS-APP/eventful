#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_DIR="$ROOT/python"
VENV_DIR="$PYTHON_DIR/venv"

echo "==> Backend root: $ROOT"
echo "==> IPython will use PRODUCTION Firebase (eventful-23690)"
echo "    Be careful: Auth/Firestore writes are real."
echo ""

if [[ ! -d "$VENV_DIR" ]]; then
  echo "==> Creating Python venv..."
  python3 -m venv "$VENV_DIR"
fi

# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"

echo "==> Installing Python packages..."
python -m pip install --upgrade pip >/dev/null
python -m pip install -r "$PYTHON_DIR/requirements.txt"
python -m pip install ipython >/dev/null

if [[ -f "$PYTHON_DIR/.secret.local" ]]; then
  # Expose secrets as env vars for local IPython (defineSecret/SecretParam style)
  set -a
  # shellcheck disable=SC1091
  source "$PYTHON_DIR/.secret.local"
  set +a
  echo "==> Loaded python/.secret.local into environment"
else
  echo "==> Warning: python/.secret.local missing"
fi

cd "$PYTHON_DIR"
export PYTHONPATH="$PYTHON_DIR${PYTHONPATH:+:$PYTHONPATH}"

exec ipython -i "$PYTHON_DIR/dev_startup.py"
