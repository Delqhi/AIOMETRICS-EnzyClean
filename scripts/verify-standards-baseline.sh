#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DOC_PATH="${NLM_STANDARDS_DOC_PATH:-$REPO_ROOT/STANDARDS_BASELINE.md}"
MODE="${NLM_STANDARDS_VERIFY_MODE:-full}" # full | freshness
MAX_AGE_DAYS="${NLM_STANDARDS_MAX_AGE_DAYS:-35}"
TIMEOUT_SECONDS="${NLM_STANDARDS_TIMEOUT_SECONDS:-20}"
RETRIES="${NLM_STANDARDS_RETRIES:-2}"

usage() {
  cat <<'USAGE'
Usage:
  ./scripts/verify-standards-baseline.sh [--mode full|freshness]

Environment:
  NLM_STANDARDS_DOC_PATH           Path to STANDARDS_BASELINE.md
  NLM_STANDARDS_MAX_AGE_DAYS       Maximum allowed days since <last_verified_utc> (default: 35)
  NLM_STANDARDS_TIMEOUT_SECONDS    Curl timeout in seconds (default: 20)
  NLM_STANDARDS_RETRIES            Curl retry count (default: 2)
USAGE
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --mode)
      shift
      MODE="${1:-}"
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

if [ "$MODE" != "full" ] && [ "$MODE" != "freshness" ]; then
  echo "ERROR: invalid mode '$MODE' (expected full|freshness)" >&2
  exit 1
fi

for cmd in sed grep date; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "ERROR: missing command '$cmd'" >&2
    exit 1
  fi
done

if ! [[ "$MAX_AGE_DAYS" =~ ^[0-9]+$ ]]; then
  echo "ERROR: NLM_STANDARDS_MAX_AGE_DAYS must be numeric" >&2
  exit 1
fi

if ! [[ "$TIMEOUT_SECONDS" =~ ^[0-9]+$ ]]; then
  echo "ERROR: NLM_STANDARDS_TIMEOUT_SECONDS must be numeric" >&2
  exit 1
fi

if ! [[ "$RETRIES" =~ ^[0-9]+$ ]]; then
  echo "ERROR: NLM_STANDARDS_RETRIES must be numeric" >&2
  exit 1
fi

if [ ! -f "$DOC_PATH" ]; then
  echo "ERROR: standards baseline not found: $DOC_PATH" >&2
  exit 2
fi

to_epoch() {
  local ymd="$1"

  if command -v python3 >/dev/null 2>&1; then
    python3 - "$ymd" <<'PY'
import sys
from datetime import datetime, timezone
d = datetime.strptime(sys.argv[1], "%Y-%m-%d").replace(tzinfo=timezone.utc)
print(int(d.timestamp()))
PY
    return 0
  fi

  if date -u -d "$ymd" +%s >/dev/null 2>&1; then
    date -u -d "$ymd" +%s
    return 0
  fi

  if date -u -j -f "%Y-%m-%d" "$ymd" +%s >/dev/null 2>&1; then
    date -u -j -f "%Y-%m-%d" "$ymd" +%s
    return 0
  fi

  echo "ERROR: no compatible date parser for '$ymd'" >&2
  return 1
}

extract_tag_value() {
  local tag="$1"
  sed -n "s|.*<$tag>\\(.*\\)</$tag>.*|\\1|p" "$DOC_PATH" | head -n 1
}

assert_freshness() {
  local last_verified
  last_verified="$(extract_tag_value "last_verified_utc")"
  if [ -z "$last_verified" ]; then
    echo "ERROR: <last_verified_utc> missing in $DOC_PATH" >&2
    return 1
  fi

  if ! [[ "$last_verified" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
    echo "ERROR: invalid <last_verified_utc> format '$last_verified' (expected YYYY-MM-DD)" >&2
    return 1
  fi

  local now_epoch verified_epoch age_days
  now_epoch="$(date -u +%s)"
  verified_epoch="$(to_epoch "$last_verified")"
  age_days="$(( (now_epoch - verified_epoch) / 86400 ))"

  echo "[freshness] last_verified_utc=$last_verified age_days=$age_days max_age_days=$MAX_AGE_DAYS"

  if [ "$age_days" -gt "$MAX_AGE_DAYS" ]; then
    echo "ERROR: standards baseline is stale (age_days=$age_days > max_age_days=$MAX_AGE_DAYS)" >&2
    return 1
  fi
}

fetch_url() {
  local url="$1"
  local out="$2"
  local i
  for (( i=1; i<=RETRIES; i++ )); do
    if curl -fsSL --compressed --max-time "$TIMEOUT_SECONDS" \
      -A "AIOMETRICS-StandardsCheck/1.0" "$url" >"$out" 2>/dev/null; then
      return 0
    fi
    sleep 1
  done
  return 1
}

assert_external_sources() {
  if ! command -v curl >/dev/null 2>&1; then
    echo "ERROR: curl is required for --mode full" >&2
    return 1
  fi

  local tmp
  tmp="$(mktemp)"
  trap 'rm -f "$tmp"' RETURN

  local failed=0
  while IFS='|' read -r url pattern label; do
    [ -n "$url" ] || continue
    echo "[source-check] $label -> $url"
    if ! fetch_url "$url" "$tmp"; then
      echo "ERROR: source fetch failed for $label ($url)" >&2
      failed=1
      continue
    fi
    if ! grep -Eiq "$pattern" "$tmp"; then
      echo "ERROR: drift suspected for $label; expected pattern '$pattern' not found" >&2
      failed=1
      continue
    fi
    echo "[source-check] OK $label"
  done <<'CHECKS'
https://www.iso.org/standard/72089.html|29148|ISO_29148
https://www.nasa.gov/intelligent-systems-division/software-management-office/nasa-software-engineering-procedural-requirements-standards-and-related-resources/|Software Engineering Procedural Requirements|NASA_7150_RESOURCES
https://nodis3.gsfc.nasa.gov/displayDir.cfm?Internal_ID=N_PR_7150_002D_&page_name=main|NPR 7150\.2D|NASA_NODIS_7150
https://airc.nist.gov/|AI Risk Management Framework|NIST_AI_RMF
https://genai.owasp.org/llm-top-10/|Top 10 for LLMs|OWASP_LLM_TOP10
CHECKS

  if [ "$failed" -ne 0 ]; then
    return 1
  fi
}

echo "Standards baseline verification"
echo "mode=$MODE"
echo "doc_path=$DOC_PATH"

assert_freshness

if [ "$MODE" = "full" ]; then
  assert_external_sources
fi

echo "Standards baseline verification passed."
