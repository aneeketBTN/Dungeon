#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(dirname "$SCRIPT_DIR")
PORT=8099
GRADER=off

for ARG in "$@"; do
  case "$ARG" in
    --grader) GRADER=on ;;
    *[!0-9]*|'')
      echo "Usage: bash tools/start-mac.sh [--grader] [port]" >&2
      exit 2
      ;;
    *) PORT=$ARG ;;
  esac
done

if [ "$GRADER" = on ]; then
  : "${DUNGEON_TRANSCRIPTS:?Set DUNGEON_TRANSCRIPTS to the external Term 6 transcript root}"
  : "${DUNGEON_GRADER_MODEL:?Set DUNGEON_GRADER_MODEL to the exact loaded LM Studio model ID}"
  : "${DUNGEON_GRADER_APPROVED_MODEL:?Set DUNGEON_GRADER_APPROVED_MODEL only after owner approval of the exact checkpoint ID}"
  : "${DUNGEON_EMBEDDING_MODEL:?Set DUNGEON_EMBEDDING_MODEL to the exact loaded LM Studio embedding model ID}"
  [ "$DUNGEON_GRADER_APPROVED_MODEL" = "$DUNGEON_GRADER_MODEL" ] || { echo "Approved model ID does not match the configured model" >&2; exit 2; }
  [ -d "$DUNGEON_TRANSCRIPTS" ] || { echo "Transcript directory not found: $DUNGEON_TRANSCRIPTS" >&2; exit 2; }
  command -v node >/dev/null 2>&1 || { echo "Node.js 20 or newer is required for local grading" >&2; exit 2; }
  NODE_MAJOR=$(node -p "Number(process.versions.node.split('.')[0])")
  [ "$NODE_MAJOR" -ge 20 ] || { echo "Node.js 20 or newer is required for local grading (found $(node -v))" >&2; exit 2; }
  export DUNGEON_LOCAL_GRADER=on
  export LM_STUDIO_BASE_URL=${LM_STUDIO_BASE_URL:-http://127.0.0.1:1234/v1}
fi

cd "$PROJECT_ROOT"
exec python3 tools/server.py "$PORT"
