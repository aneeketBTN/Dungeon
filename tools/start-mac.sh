#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(dirname "$SCRIPT_DIR")
PORT=${1:-8099}

cd "$PROJECT_ROOT"
exec python3 tools/server.py "$PORT"
