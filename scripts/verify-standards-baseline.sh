#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DOC_PATH="${NLM_STANDARDS_DOC_PATH:-$REPO_ROOT/STANDARDS_BASELINE.md}"
TAB_TITLE="${NLM_STANDARDS_TAB_TITLE:-NOTEBOOKLM.md}"
AGENTS_PATH="${NLM_AGENTS_PATH:-$REPO_ROOT/AGENTS.md}"
WORKSPACE_ROOT="$(cd "$REPO_ROOT/.." && pwd)"
DEFAULT_CONFIG_WORKSPACE="$WORKSPACE_ROOT/shared/config/notebooklm-portfolio.json"
DEFAULT_CONFIG_LOCAL="$REPO_ROOT/shared/config/notebooklm-portfolio.json"
if [ -f "$DEFAULT_CONFIG_WORKSPACE" ]; then
  DEFAULT_CONFIG="$DEFAULT_CONFIG_WORKSPACE"
elif [ -f "$DEFAULT_CONFIG_LOCAL" ]; then
  DEFAULT_CONFIG="$DEFAULT_CONFIG_LOCAL"
else
  DEFAULT_CONFIG="$DEFAULT_CONFIG_WORKSPACE"
fi
CONFIG_PATH="${NLM_CONFIG:-$DEFAULT_CONFIG}"
REPO_BASENAME="$(basename "$REPO_ROOT")"
MODE="${NLM_STANDARDS_VERIFY_MODE:-full}" # full | freshness
MAX_AGE_DAYS="${NLM_STANDARDS_MAX_AGE_DAYS:-35}"
TIMEOUT_SECONDS="${NLM_STANDARDS_TIMEOUT_SECONDS:-20}"
RETRIES="${NLM_STANDARDS_RETRIES:-2}"
ACTIVE_DOC_PATH="$DOC_PATH"
REMOTE_DOC_TMP=""

usage() {
  cat <<'USAGE'
Usage:
  ./scripts/verify-standards-baseline.sh [--mode full|freshness]

Environment:
  NLM_STANDARDS_DOC_PATH           Path to STANDARDS_BASELINE.md
  NLM_STANDARDS_TAB_TITLE          Google Doc tab title fallback (default: NOTEBOOKLM.md)
  NLM_AGENTS_PATH                  Path to AGENTS.md for PROJECT_GOOGLE_DOC_ID fallback
  NLM_STANDARDS_MAX_AGE_DAYS       Maximum allowed days since <last_verified_utc> (default: 35)
  NLM_STANDARDS_TIMEOUT_SECONDS    Curl timeout in seconds (default: 20)
  NLM_STANDARDS_RETRIES            Curl retry count (default: 2)
  PROJECT_GOOGLE_DOC_ID            Optional explicit Google Doc ID
  GOOGLE_OAUTH_ACCESS_TOKEN        Optional explicit bearer token for Docs API reads
  GOOGLE_SERVICE_ACCOUNT_KEY       Optional service-account key for Docs API fallback
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

cleanup_remote_doc() {
  if [ -n "$REMOTE_DOC_TMP" ] && [ -f "$REMOTE_DOC_TMP" ]; then
    rm -f "$REMOTE_DOC_TMP"
  fi
}

trap cleanup_remote_doc EXIT

normalize_repo_key() {
  printf '%s' "$1" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//'
}

detect_repo_key() {
  if [ -n "${NLM_REPO_KEY:-}" ]; then
    echo "$NLM_REPO_KEY"
    return 0
  fi

  local normalized
  normalized="$(normalize_repo_key "$REPO_BASENAME")"

  if [ ! -f "$CONFIG_PATH" ]; then
    echo "$normalized"
    return 0
  fi

  local by_path
  by_path="$(jq -r --arg p "$REPO_BASENAME" '.repos[] | select((.path // "") == $p) | .repo' "$CONFIG_PATH" | head -n 1)"
  if [ -n "$by_path" ] && [ "$by_path" != "null" ]; then
    echo "$by_path"
    return 0
  fi

  local by_repo
  by_repo="$(jq -r --arg r "$normalized" '.repos[] | select(.repo == $r) | .repo' "$CONFIG_PATH" | head -n 1)"
  if [ -n "$by_repo" ] && [ "$by_repo" != "null" ]; then
    echo "$by_repo"
    return 0
  fi

  local by_alias
  by_alias="$(jq -r --arg a "$normalized" '.repos[] | select(((.aliases // []) | index($a)) != null) | .repo' "$CONFIG_PATH" | head -n 1)"
  if [ -n "$by_alias" ] && [ "$by_alias" != "null" ]; then
    echo "$by_alias"
    return 0
  fi

  echo "$normalized"
}

resolve_google_doc_id() {
  if [ -n "${PROJECT_GOOGLE_DOC_ID:-}" ]; then
    echo "$PROJECT_GOOGLE_DOC_ID"
    return 0
  fi

  if [ -f "$AGENTS_PATH" ]; then
    local agents_id
    agents_id="$(sed -n 's/.*PROJECT_GOOGLE_DOC_ID: `\([^`]*\)`.*/\1/p' "$AGENTS_PATH" | head -n 1)"
    if [ -n "$agents_id" ] && [ "$agents_id" != "null" ]; then
      echo "$agents_id"
      return 0
    fi
  fi

  if [ -f "$CONFIG_PATH" ]; then
    local repo_key
    repo_key="$(detect_repo_key)"
    local config_id
    config_id="$(jq -r --arg repo "$repo_key" '.repos[] | select(.repo == $repo) | .kernel.google_doc_id' "$CONFIG_PATH" | head -n 1)"
    if [ -n "$config_id" ] && [ "$config_id" != "null" ]; then
      echo "$config_id"
      return 0
    fi
  fi

  echo ""
}

resolve_google_token() {
  if [ -n "${GOOGLE_OAUTH_ACCESS_TOKEN:-}" ]; then
    printf '%s' "$GOOGLE_OAUTH_ACCESS_TOKEN"
    return 0
  fi

  local key_path="${GOOGLE_SERVICE_ACCOUNT_KEY:-}"

  if [ -z "$key_path" ] && [ -n "${GOOGLE_APPLICATION_CREDENTIALS:-}" ] && [ -f "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    key_path="$GOOGLE_APPLICATION_CREDENTIALS"
  fi

  if [ -z "$key_path" ] && [ -f "$HOME/dev/Meine-Google-Credentials/credentials.json" ]; then
    key_path="$HOME/dev/Meine-Google-Credentials/credentials.json"
  fi

  if [ -n "$key_path" ] && [ -f "$key_path" ]; then
    GOOGLE_SERVICE_ACCOUNT_KEY="$key_path" python3 - <<'PY'
from google.oauth2 import service_account
from google.auth.transport.requests import Request
import os
key = os.environ['GOOGLE_SERVICE_ACCOUNT_KEY']
scopes = ['https://www.googleapis.com/auth/documents','https://www.googleapis.com/auth/drive']
creds = service_account.Credentials.from_service_account_file(key, scopes=scopes)
creds.refresh(Request())
print(creds.token)
PY
    return 0
  fi

  if command -v gcloud >/dev/null 2>&1; then
    gcloud auth print-access-token
    return 0
  fi

  echo ""
}

fetch_google_doc_tab_to_file() {
  local doc_id="$1"
  local tab_title="$2"
  local out="$3"
  local token
  token="$(resolve_google_token)"

  if [ -z "$token" ]; then
    echo "ERROR: no Google Docs token source available for fallback tab fetch" >&2
    return 1
  fi

GOOGLE_OAUTH_ACCESS_TOKEN="$token" python3 - "$doc_id" "$tab_title" "$out" <<'PY'
import json
import os
import requests
import sys

doc_id, tab_title, out = sys.argv[1], sys.argv[2], sys.argv[3]
r = requests.get(
    f'https://docs.googleapis.com/v1/documents/{doc_id}?includeTabsContent=true',
    headers={'Authorization': f"Bearer {os.environ['GOOGLE_OAUTH_ACCESS_TOKEN']}"},
    timeout=60,
)
r.raise_for_status()
obj = r.json()

def walk(tabs):
    for tab in tabs or []:
        yield tab
        yield from walk(tab.get('childTabs', []))

def extract_text(tab):
    parts = []
    for content in (((tab.get('documentTab') or {}).get('body') or {}).get('content') or []):
        para = content.get('paragraph') or {}
        for element in para.get('elements') or []:
            text_run = element.get('textRun') or {}
            if 'content' in text_run:
                parts.append(text_run['content'])
    return ''.join(parts)

fallback_text = None
for tab in walk(obj.get('tabs', [])):
    props = tab.get('tabProperties') or {}
    text = extract_text(tab)
    if props.get('title', '') == tab_title:
        with open(out, 'w', encoding='utf-8') as fh:
            fh.write(text)
        raise SystemExit(0)
    if fallback_text is None and '<last_verified_utc>' in text:
        fallback_text = text

if fallback_text is not None:
    with open(out, 'w', encoding='utf-8') as fh:
        fh.write(fallback_text)
    raise SystemExit(0)

raise SystemExit(f"ERROR: Google Doc tab not found and no standards markers found: {tab_title}")
PY
}

if [ ! -f "$DOC_PATH" ]; then
  doc_id="$(resolve_google_doc_id)"
  if [ -z "$doc_id" ]; then
    echo "ERROR: standards baseline not found locally and PROJECT_GOOGLE_DOC_ID could not be resolved" >&2
    exit 2
  fi
  REMOTE_DOC_TMP="$(mktemp)"
  if ! fetch_google_doc_tab_to_file "$doc_id" "$TAB_TITLE" "$REMOTE_DOC_TMP"; then
    echo "ERROR: standards baseline fallback fetch failed for Google Doc $doc_id tab $TAB_TITLE" >&2
    exit 2
  fi
  ACTIVE_DOC_PATH="$REMOTE_DOC_TMP"
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
  sed -n "s|.*<$tag>\\(.*\\)</$tag>.*|\\1|p" "$ACTIVE_DOC_PATH" | head -n 1
}

assert_freshness() {
  local last_verified
  last_verified="$(extract_tag_value "last_verified_utc")"
  if [ -z "$last_verified" ]; then
    echo "ERROR: <last_verified_utc> missing in $ACTIVE_DOC_PATH" >&2
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
echo "doc_path=$ACTIVE_DOC_PATH"

assert_freshness

if [ "$MODE" = "full" ]; then
  assert_external_sources
fi

echo "Standards baseline verification passed."
