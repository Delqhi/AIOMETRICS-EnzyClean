#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
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
NOTEBOOK_SCOPE="${NLM_JUDGE_SCOPE:-dev}" # dev | info

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

REPO_KEY="$(detect_repo_key)"

usage() {
  cat <<'USAGE'
Usage:
  ./scripts/nlm-judge-query.sh rules <module>
  ./scripts/nlm-judge-query.sh next <module>
  ./scripts/nlm-judge-query.sh browser <workflow>
  ./scripts/nlm-judge-query.sh custom "<question>"

Environment:
  NLM_JUDGE_NOTEBOOK_ID  Explicit notebook ID override
  NLM_JUDGE_SCOPE        Notebook scope: dev|info (default: dev)
  NLM_REPO_KEY           Explicit portfolio repo key override
  NLM_CONFIG             Portfolio config path override
  NLM_PROFILE            Optional nlm profile
USAGE
}

if [ "${1:-}" = "" ] || [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
  usage
  exit 0
fi

if ! command -v nlm >/dev/null 2>&1; then
  echo "ERROR: nlm command not found" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "ERROR: jq command not found" >&2
  exit 1
fi

if [ "$NOTEBOOK_SCOPE" != "dev" ] && [ "$NOTEBOOK_SCOPE" != "info" ]; then
  echo "ERROR: NLM_JUDGE_SCOPE must be dev or info" >&2
  exit 1
fi

resolve_notebook_id() {
  if [ -n "${NLM_JUDGE_NOTEBOOK_ID:-}" ]; then
    echo "$NLM_JUDGE_NOTEBOOK_ID"
    return 0
  fi

  if [ ! -f "$CONFIG_PATH" ]; then
    echo ""
    return 0
  fi

  jq -r --arg repo "$REPO_KEY" --arg scope "$NOTEBOOK_SCOPE" '.repos[] | select(.repo == $repo) | .[$scope].id' "$CONFIG_PATH" | head -n 1
}

MODE="$1"
shift

QUESTION=""
case "$MODE" in
  rules)
    MODULE="${1:-}"
    if [ -z "$MODULE" ]; then
      echo "ERROR: module argument required for mode=rules" >&2
      exit 1
    fi
    QUESTION="Welche <critical_invariant> und <halt_condition> gelten fuer Modul $MODULE?"
    ;;
  next)
    MODULE="${1:-}"
    if [ -z "$MODULE" ]; then
      echo "ERROR: module argument required for mode=next" >&2
      exit 1
    fi
    QUESTION="Welche Artefakte fehlen fuer Modul $MODULE bis Definition of Done? Nenne IDs und Prioritaet."
    ;;
  browser)
    WORKFLOW="${1:-}"
    if [ -z "$WORKFLOW" ]; then
      echo "ERROR: workflow argument required for mode=browser" >&2
      exit 1
    fi
    QUESTION="Welche <interaction_invariant>, <security_gate> und <halt_condition> gelten fuer Browser-Workflow $WORKFLOW?"
    ;;
  custom)
    QUESTION="${1:-}"
    if [ -z "$QUESTION" ]; then
      echo "ERROR: question argument required for mode=custom" >&2
      exit 1
    fi
    ;;
  *)
    echo "ERROR: invalid mode '$MODE'" >&2
    usage
    exit 1
    ;;
esac

NOTEBOOK_ID="$(resolve_notebook_id)"
if [ -z "$NOTEBOOK_ID" ] || [ "$NOTEBOOK_ID" = "null" ]; then
  echo "ERROR: could not resolve judge notebook id" >&2
  exit 2
fi

PROFILE_ARGS=()
if [ -n "${NLM_PROFILE:-}" ]; then
  PROFILE_ARGS+=(--profile "$NLM_PROFILE")
fi

TMP_JSON="$(mktemp)"
cleanup() {
  rm -f "$TMP_JSON"
}
trap cleanup EXIT

nlm notebook query "$NOTEBOOK_ID" "$QUESTION" --json "${PROFILE_ARGS[@]}" > "$TMP_JSON"

CITATION_COUNT="$({
  jq -r '
    def as_array:
      if . == null then []
      elif (type == "array") then .
      else [.] end;

    def count_any(x):
      if x == null then 0
      elif (x|type) == "array" then (x|length)
      elif (x|type) == "object" then (x|keys|length)
      else 1 end;

    (
      count_any(.citations)
      + count_any(.sources)
      + count_any(.source_citations)
      + count_any(.response.citations)
      + count_any(.answer.citations)
      + count_any(.value.citations)
      + count_any(.value.sources_used)
    )
  ' "$TMP_JSON" 2>/dev/null || echo 0
} | tail -n 1)"

ANSWER="$(jq -r '
  if (.value.answer | type) == "string" then .value.answer
  elif (.answer | type) == "string" then .answer
  elif (.response | type) == "string" then .response
  elif (.text | type) == "string" then .text
  elif (.message | type) == "string" then .message
  elif (.output | type) == "string" then .output
  else "" end
' "$TMP_JSON")"

if [ -z "$ANSWER" ]; then
  ANSWER="$(jq -r '.' "$TMP_JSON")"
fi

echo "mode=$MODE"
echo "repo_key=$REPO_KEY"
echo "scope=$NOTEBOOK_SCOPE"
echo "notebook_id=$NOTEBOOK_ID"
echo "question=$QUESTION"
echo "citation_count=$CITATION_COUNT"
echo
echo "$ANSWER"

if [ "$CITATION_COUNT" = "0" ]; then
  echo
  echo "BLOCKED: no citations/evidence metadata detected; stop execution." >&2
  exit 3
fi
