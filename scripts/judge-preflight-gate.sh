#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
QUERY_SCRIPT="$SCRIPT_DIR/nlm-judge-query.sh"
STANDARDS_VERIFY_SCRIPT="$SCRIPT_DIR/verify-standards-baseline.sh"
MIN_CITATIONS="${NLM_MIN_CITATIONS:-1}"
MODULE="${NLM_GATE_MODULE:-CoreModule}"
WORKFLOW="${NLM_GATE_WORKFLOW:-LoginFlow}"
ENFORCE_STANDARDS_FRESHNESS="${NLM_ENFORCE_STANDARDS_FRESHNESS:-1}"
ALLOW_AUTH_FAILURE="${NLM_ALLOW_AUTH_FAILURE:-0}"
AUTH_SKIPPED=0

usage() {
  cat <<'USAGE'
Usage:
  ./scripts/judge-preflight-gate.sh [--module <name>] [--workflow <name>]

Environment:
  NLM_MIN_CITATIONS   Minimum citations required per gate query (default: 1)
  NLM_GATE_MODULE     Default module if --module not provided
  NLM_GATE_WORKFLOW   Default workflow if --workflow not provided
  NLM_ENFORCE_STANDARDS_FRESHNESS  Run standards freshness check first (default: 1)
  NLM_ALLOW_AUTH_FAILURE  Treat NotebookLM auth errors as skip (default: 0)
USAGE
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --module)
      shift
      MODULE="${1:-}"
      ;;
    --workflow)
      shift
      WORKFLOW="${1:-}"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "ERROR: unknown argument '$1'" >&2
      usage
      exit 1
      ;;
  esac
  shift
 done

if ! [[ "$MIN_CITATIONS" =~ ^[0-9]+$ ]]; then
  echo "ERROR: NLM_MIN_CITATIONS must be numeric" >&2
  exit 1
fi

if [ ! -x "$QUERY_SCRIPT" ]; then
  echo "ERROR: query script not executable: $QUERY_SCRIPT" >&2
  exit 1
fi

if [ "$ENFORCE_STANDARDS_FRESHNESS" = "1" ]; then
  if [ ! -x "$STANDARDS_VERIFY_SCRIPT" ]; then
    echo "ERROR: standards verify script not executable: $STANDARDS_VERIFY_SCRIPT" >&2
    exit 1
  fi
fi

run_gate() {
  local mode="$1"
  local arg="$2"
  local out
  out="$(mktemp)"
  trap 'rm -f "$out"' RETURN

  if ! "$QUERY_SCRIPT" "$mode" "$arg" >"$out" 2>&1; then
    if [ "$ALLOW_AUTH_FAILURE" = "1" ] && rg -qi 'Authentication expired|Run `nlm login`|Profile .+ not found' "$out"; then
      echo "[gate:$mode] SKIP auth_unavailable"
      AUTH_SKIPPED=1
      return 0
    fi
    echo "[gate:$mode] FAILED" >&2
    sed -n '1,120p' "$out" >&2 || true
    return 1
  fi

  local citations
  citations="$(awk -F= '/^citation_count=/{print $2; exit}' "$out")"
  if ! [[ "$citations" =~ ^[0-9]+$ ]]; then
    echo "[gate:$mode] FAILED: citation_count missing" >&2
    sed -n '1,80p' "$out" >&2 || true
    return 1
  fi

  if [ "$citations" -lt "$MIN_CITATIONS" ]; then
    echo "[gate:$mode] FAILED: citation_count=$citations < min=$MIN_CITATIONS" >&2
    sed -n '1,80p' "$out" >&2 || true
    return 1
  fi

  echo "[gate:$mode] OK citation_count=$citations"
}

echo "Judge preflight gate"
echo "module=$MODULE"
echo "workflow=$WORKFLOW"
echo "min_citations=$MIN_CITATIONS"
echo "allow_auth_failure=$ALLOW_AUTH_FAILURE"

if [ "$ENFORCE_STANDARDS_FRESHNESS" = "1" ]; then
  echo "enforce_standards_freshness=1"
  "$STANDARDS_VERIFY_SCRIPT" --mode freshness
else
  echo "enforce_standards_freshness=0"
fi

run_gate rules "$MODULE"
run_gate next "$MODULE"
run_gate browser "$WORKFLOW"

if [ "$AUTH_SKIPPED" = "1" ]; then
  echo "Judge preflight gate skipped due to auth_unavailable (allowed by NLM_ALLOW_AUTH_FAILURE=1)."
  exit 0
fi

echo "All judge gates passed."
