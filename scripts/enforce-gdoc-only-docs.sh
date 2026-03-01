#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${1:-.}"
MODE="${GDOC_ONLY_MODE:-report}"   # report | enforce
ALLOW_FILE="${GDOC_ALLOW_FILE:-AGENTS.md}"

usage() {
  cat <<'USAGE'
Usage:
  ./shared/scripts/enforce-gdoc-only-docs.sh [repo_dir]

Environment:
  GDOC_ONLY_MODE   report|enforce (default: report)
  GDOC_ALLOW_FILE  allowed local doc filename (default: AGENTS.md)

Behavior:
  - Scans for local documentation files.
  - Allowed: one file (default AGENTS.md).
  - In enforce mode exits non-zero if extra docs are found.
USAGE
}

if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
  usage
  exit 0
fi

if [ "$MODE" != "report" ] && [ "$MODE" != "enforce" ]; then
  echo "ERROR: GDOC_ONLY_MODE must be report or enforce" >&2
  exit 2
fi

if [ ! -d "$REPO_DIR" ]; then
  echo "ERROR: repo dir not found: $REPO_DIR" >&2
  exit 2
fi

mapfile -t FOUND < <(
  cd "$REPO_DIR" && find . -type f \
    \( -name '*.md' -o -name '*.txt' -o -name '*.rst' -o -name '*.doc' -o -name '*.docx' \) \
    ! -path './.git/*' \
    ! -path './node_modules/*' \
    ! -path './dist/*' \
    ! -path './build/*' \
    ! -path './.next/*' \
    ! -path './coverage/*' \
    ! -path './venv/*' \
    ! -path './.venv/*' \
    | sed 's#^\./##' \
    | sort
)

extra=0
for rel in "${FOUND[@]}"; do
  base="$(basename "$rel")"
  if [ "$base" = "$ALLOW_FILE" ]; then
    continue
  fi
  if [ "$extra" -eq 0 ]; then
    echo "Extra local docs detected (Google-Doc-only policy):"
  fi
  echo "  - $rel"
  extra=$((extra + 1))
done

if [ "$extra" -eq 0 ]; then
  echo "OK: only allowed local doc file present ($ALLOW_FILE)."
  exit 0
fi

if [ "$MODE" = "enforce" ]; then
  echo "BLOCKED: remove/migrate extra local docs first." >&2
  exit 1
fi

echo "REPORT: migration still pending for $extra file(s)."
