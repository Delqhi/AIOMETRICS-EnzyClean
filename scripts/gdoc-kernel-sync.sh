#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "$SCRIPT_DIR/../config/notebooklm-portfolio.json" ]; then
  # Running from workspace shared/scripts
  BASE="$(cd "$SCRIPT_DIR/../.." && pwd)"
  DEFAULT_CONFIG="$SCRIPT_DIR/../config/notebooklm-portfolio.json"
elif [ -f "$SCRIPT_DIR/../../shared/config/notebooklm-portfolio.json" ]; then
  # Running from a project repo that still has workspace-level shared config
  BASE="$(cd "$SCRIPT_DIR/../.." && pwd)"
  DEFAULT_CONFIG="$SCRIPT_DIR/../../shared/config/notebooklm-portfolio.json"
else
  # Standalone repo mode (config optional)
  BASE="$(cd "$SCRIPT_DIR/.." && pwd)"
  DEFAULT_CONFIG="$BASE/shared/config/notebooklm-portfolio.json"
fi

CONFIG="${NLM_CONFIG:-$DEFAULT_CONFIG}"

MODE="${KERNEL_MODE:-dry-run}"                     # dry-run | sync
TARGET="${1:-}"                                    # repo key | repo path | absolute repo dir
DOC_ID="${PROJECT_GOOGLE_DOC_ID:-}"
NOTEBOOK_ID="${PROJECT_NOTEBOOK_ID:-}"
DOC_TITLE="${PROJECT_GOOGLE_DOC_TITLE:-}"
CREATE_DOC="${CREATE_GOOGLE_DOC_IF_MISSING:-0}"    # 0 | 1
WRITE_AGENTS_MD="${WRITE_AGENTS_MD:-1}"            # 0 | 1
DELETE_LOCAL_DOCS="${DELETE_LOCAL_DOCS:-0}"        # 0 | 1
CONFIRM_DELETE="${CONFIRM_DELETE:-}"
ENFORCE_SINGLE_SOURCE="${ENFORCE_SINGLE_SOURCE:-1}" # 0 | 1
SYNC_NOTEBOOK="${SYNC_NOTEBOOK:-1}"                # 0 | 1
STALE_DAYS="${STALE_DAYS:-120}"
MAX_FILE_CHARS="${MAX_FILE_CHARS:-150000}"
NLM_PROFILE="${NLM_PROFILE:-}"
GOOGLE_SERVICE_ACCOUNT_KEY="${GOOGLE_SERVICE_ACCOUNT_KEY:-}"
GOOGLE_OAUTH_ACCESS_TOKEN="${GOOGLE_OAUTH_ACCESS_TOKEN:-}"
GOOGLE_ACCESS_TOKEN_CMD="${GOOGLE_ACCESS_TOKEN_CMD:-}"

declare -A REPO_PATH=()

usage() {
  cat <<'USAGE'
Usage:
  ./shared/scripts/gdoc-kernel-sync.sh <repo-key|repo-path|abs-path>

Environment:
  KERNEL_MODE                    dry-run|sync (default: dry-run)
  PROJECT_GOOGLE_DOC_ID          Google Doc ID (override)
  PROJECT_NOTEBOOK_ID            NotebookLM ID (override)
  PROJECT_GOOGLE_DOC_TITLE       Title for doc creation (if needed)
  CREATE_GOOGLE_DOC_IF_MISSING   0|1 (default: 0)
  WRITE_AGENTS_MD                0|1 (default: 1)
  DELETE_LOCAL_DOCS              0|1 (default: 0)
  CONFIRM_DELETE                 must be YES_DELETE_LOCAL_DOCS when DELETE_LOCAL_DOCS=1
  ENFORCE_SINGLE_SOURCE          0|1 (default: 1)
  SYNC_NOTEBOOK                  0|1 (default: 1)
  STALE_DAYS                     age threshold for "review required" (default: 120)
  MAX_FILE_CHARS                 per-file max chars inserted in one tab (default: 150000)
  GOOGLE_SERVICE_ACCOUNT_KEY     path to service-account JSON key
  GOOGLE_OAUTH_ACCESS_TOKEN      explicit OAuth bearer token
  GOOGLE_ACCESS_TOKEN_CMD        command that prints OAuth bearer token
  NLM_PROFILE                    optional nlm profile

Behavior:
  - Scans local project docs (*.md, *.txt, *.rst).
  - Audits each file (age/path heuristics) before migration.
  - Writes each file into one dedicated Google Doc tab.
  - Keeps AGENTS.md local and rewrites it to enforce Google-Doc-only workflow.
  - Ensures NotebookLM uses the project Google Doc as source.
USAGE
}

if [ -z "$TARGET" ] || [ "$TARGET" = "--help" ] || [ "$TARGET" = "-h" ]; then
  usage
  exit 0
fi

if [ "$MODE" != "dry-run" ] && [ "$MODE" != "sync" ]; then
  echo "ERROR: KERNEL_MODE must be dry-run or sync" >&2
  exit 1
fi

if [ "$WRITE_AGENTS_MD" != "0" ] && [ "$WRITE_AGENTS_MD" != "1" ]; then
  echo "ERROR: WRITE_AGENTS_MD must be 0 or 1" >&2
  exit 1
fi

if [ "$DELETE_LOCAL_DOCS" != "0" ] && [ "$DELETE_LOCAL_DOCS" != "1" ]; then
  echo "ERROR: DELETE_LOCAL_DOCS must be 0 or 1" >&2
  exit 1
fi

if [ "$ENFORCE_SINGLE_SOURCE" != "0" ] && [ "$ENFORCE_SINGLE_SOURCE" != "1" ]; then
  echo "ERROR: ENFORCE_SINGLE_SOURCE must be 0 or 1" >&2
  exit 1
fi

if [ "$SYNC_NOTEBOOK" != "0" ] && [ "$SYNC_NOTEBOOK" != "1" ]; then
  echo "ERROR: SYNC_NOTEBOOK must be 0 or 1" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "ERROR: jq is required" >&2
  exit 1
fi

if ! command -v nlm >/dev/null 2>&1; then
  echo "ERROR: nlm is required" >&2
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "ERROR: curl is required" >&2
  exit 1
fi

if ! command -v rg >/dev/null 2>&1; then
  echo "ERROR: rg is required" >&2
  exit 1
fi

normalize_key() {
  printf '%s' "$1" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//'
}

load_repo_paths() {
  [ -f "$CONFIG" ] || return 0
  while IFS=$'\t' read -r key path; do
    [ -n "$key" ] || continue
    REPO_PATH["$key"]="$path"
  done < <(jq -r '.repos[] | [.repo, (.path // .repo)] | @tsv' "$CONFIG")
}

resolve_repo_key_by_target() {
  local target="$1"
  local normalized

  if [ -f "$CONFIG" ]; then
    normalized="$(normalize_key "$(basename "$target")")"
    local by_repo
    by_repo="$(jq -r --arg t "$target" --arg n "$normalized" '
      .repos[]
      | select(
          .repo == $t
          or (.path // "") == $t
          or (.path // "") == ($t | split("/") | last)
          or .repo == $n
          or (((.aliases // []) | index($t)) != null)
          or (((.aliases // []) | index($n)) != null)
        )
      | .repo
    ' "$CONFIG" | head -n 1)"
    if [ -n "$by_repo" ] && [ "$by_repo" != "null" ]; then
      echo "$by_repo"
      return 0
    fi
  fi

  echo "$(normalize_key "$target")"
}

resolve_repo_dir() {
  local repo_key="$1"
  local target="$2"

  if [ -d "$target" ]; then
    (cd "$target" && pwd)
    return 0
  fi

  if [ -f "$CONFIG" ]; then
    local path
    path="$(jq -r --arg r "$repo_key" '.repos[] | select(.repo == $r) | (.path // .repo)' "$CONFIG" | head -n 1)"
    if [ -n "$path" ] && [ "$path" != "null" ] && [ -d "$BASE/$path" ]; then
      echo "$BASE/$path"
      return 0
    fi
  fi

  if [ -d "$BASE/$target" ]; then
    echo "$BASE/$target"
    return 0
  fi

  echo "ERROR: cannot resolve repo dir for target '$target'" >&2
  exit 2
}

resolve_doc_id() {
  local repo_key="$1"
  if [ -n "$DOC_ID" ]; then
    echo "$DOC_ID"
    return 0
  fi
  if [ ! -f "$CONFIG" ]; then
    echo ""
    return 0
  fi
  jq -r --arg r "$repo_key" '
    .repos[]
    | select(.repo == $r)
    | (
        .kernel.google_doc_id
        // .google_doc.id
        // .google_doc_id
        // ""
      )
  ' "$CONFIG" | head -n 1
}

resolve_notebook_id() {
  local repo_key="$1"
  if [ -n "$NOTEBOOK_ID" ]; then
    echo "$NOTEBOOK_ID"
    return 0
  fi
  if [ ! -f "$CONFIG" ]; then
    echo ""
    return 0
  fi
  jq -r --arg r "$repo_key" '
    .repos[]
    | select(.repo == $r)
    | (
        .kernel.notebook_id
        // .judge.id
        // .dev.id
        // ""
      )
  ' "$CONFIG" | head -n 1
}

run_nlm() {
  if [ -n "$NLM_PROFILE" ]; then
    nlm "$@" --profile "$NLM_PROFILE"
  else
    nlm "$@"
  fi
}

resolve_token() {
  if [ -n "$GOOGLE_OAUTH_ACCESS_TOKEN" ]; then
    echo "$GOOGLE_OAUTH_ACCESS_TOKEN"
    return 0
  fi

  if [ -n "$GOOGLE_ACCESS_TOKEN_CMD" ]; then
    eval "$GOOGLE_ACCESS_TOKEN_CMD"
    return 0
  fi

  if ! command -v gcloud >/dev/null 2>&1; then
    echo "ERROR: no token source available (set GOOGLE_OAUTH_ACCESS_TOKEN or GOOGLE_ACCESS_TOKEN_CMD, or install gcloud)" >&2
    exit 3
  fi

  if [ -n "$GOOGLE_SERVICE_ACCOUNT_KEY" ]; then
    if [ ! -f "$GOOGLE_SERVICE_ACCOUNT_KEY" ]; then
      echo "ERROR: GOOGLE_SERVICE_ACCOUNT_KEY not found: $GOOGLE_SERVICE_ACCOUNT_KEY" >&2
      exit 3
    fi
    gcloud auth activate-service-account --key-file="$GOOGLE_SERVICE_ACCOUNT_KEY" >/dev/null
  fi

  if gcloud auth print-access-token >/dev/null 2>&1; then
    gcloud auth print-access-token
    return 0
  fi

  if gcloud auth application-default print-access-token >/dev/null 2>&1; then
    gcloud auth application-default print-access-token
    return 0
  fi

  echo "ERROR: failed to resolve OAuth token" >&2
  exit 3
}

api_doc_get() {
  local token="$1"
  local doc_id="$2"
  curl -fsSL \
    -H "Authorization: Bearer $token" \
    "https://docs.googleapis.com/v1/documents/$doc_id?includeTabsContent=true"
}

api_doc_batch_update() {
  local token="$1"
  local doc_id="$2"
  local requests_json="$3"

  curl -fsSL \
    -X POST \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    "https://docs.googleapis.com/v1/documents/$doc_id:batchUpdate" \
    -d "{\"requests\":$requests_json}" >/dev/null
}

api_doc_create() {
  local token="$1"
  local title="$2"
  curl -fsSL \
    -X POST \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    "https://docs.googleapis.com/v1/documents" \
    -d "{\"title\":\"$title\"}"
}

all_tabs_tsv() {
  local doc_json="$1"
  printf '%s' "$doc_json" | jq -r '
    def walk_tabs(tabs):
      [tabs[]? as $t | $t, (walk_tabs($t.childTabs // []))[]];
    walk_tabs(.tabs // [])[]
    | [
        .tabProperties.tabId,
        (.tabProperties.title // ""),
        (
          ((.documentTab.body.content // []) | last | .endIndex)
          // 1
        )
      ]
    | @tsv
  '
}

tab_id_by_title() {
  local doc_json="$1"
  local title="$2"
  printf '%s' "$doc_json" | jq -r --arg title "$title" '
    def walk_tabs(tabs):
      [tabs[]? as $t | $t, (walk_tabs($t.childTabs // []))[]];
    walk_tabs(.tabs // [])[]
    | select((.tabProperties.title // "") == $title)
    | .tabProperties.tabId
  ' | head -n 1
}

tab_end_index_by_id() {
  local doc_json="$1"
  local tab_id="$2"
  printf '%s' "$doc_json" | jq -r --arg tab_id "$tab_id" '
    def walk_tabs(tabs):
      [tabs[]? as $t | $t, (walk_tabs($t.childTabs // []))[]];
    walk_tabs(.tabs // [])[]
    | select(.tabProperties.tabId == $tab_id)
    | (
        ((.documentTab.body.content // []) | last | .endIndex)
        // 1
      )
  ' | head -n 1
}

ensure_tab() {
  local token="$1"
  local doc_id="$2"
  local title="$3"
  local doc_json="$4"

  local existing
  existing="$(tab_id_by_title "$doc_json" "$title")"
  if [ -n "$existing" ]; then
    echo "$existing"
    return 0
  fi

  if [ "$MODE" = "dry-run" ]; then
    echo "DRY-RUN: would add tab '$title'" >&2
    echo ""
    return 0
  fi

  local req
  req="$(jq -c -n --arg title "$title" '[{addDocumentTab:{tabProperties:{title:$title}}}]')"
  api_doc_batch_update "$token" "$doc_id" "$req"

  local refreshed
  refreshed="$(api_doc_get "$token" "$doc_id")"
  tab_id_by_title "$refreshed" "$title"
}

clear_tab_text() {
  local token="$1"
  local doc_id="$2"
  local tab_id="$3"
  local end_index="$4"

  if [ "$MODE" = "dry-run" ]; then
    echo "DRY-RUN: would clear tab_id=$tab_id end_index=$end_index" >&2
    return 0
  fi

  local delete_to
  delete_to="$((end_index - 1))"
  if [ "$delete_to" -le 1 ]; then
    return 0
  fi

  local req
  req="$(jq -c -n \
    --arg tab_id "$tab_id" \
    --argjson start 1 \
    --argjson end "$delete_to" \
    '[{deleteContentRange:{range:{startIndex:$start,endIndex:$end,tabId:$tab_id}}}]'
  )"
  api_doc_batch_update "$token" "$doc_id" "$req"
}

insert_tab_text() {
  local token="$1"
  local doc_id="$2"
  local tab_id="$3"
  local text="$4"

  if [ "$MODE" = "dry-run" ]; then
    echo "DRY-RUN: would insert text into tab_id=$tab_id chars=${#text}" >&2
    return 0
  fi

  local req
  req="$(jq -c -n \
    --arg tab_id "$tab_id" \
    --arg text "$text" \
    '[{insertText:{location:{index:1,tabId:$tab_id},text:$text}}]'
  )"
  api_doc_batch_update "$token" "$doc_id" "$req"
}

sanitize_tab_title() {
  local raw="$1"
  local out
  out="$(printf '%s' "$raw" | sed -E 's#^\./##; s#[[:cntrl:]]# #g; s#[[:space:]]+# #g; s#^ +##; s# +$##')"
  if [ "${#out}" -gt 95 ]; then
    out="${out:0:95}"
  fi
  printf '%s' "$out"
}

file_mtime_epoch() {
  local file="$1"
  if stat -f '%m' "$file" >/dev/null 2>&1; then
    stat -f '%m' "$file"
  else
    stat -c '%Y' "$file"
  fi
}

file_mtime_iso() {
  local file="$1"
  local epoch
  epoch="$(file_mtime_epoch "$file")"
  date -u -r "$epoch" '+%Y-%m-%dT%H:%M:%SZ'
}

discover_doc_files() {
  local repo_dir="$1"
  (
    cd "$repo_dir"
    find . -type f \
      \( -name '*.md' -o -name '*.txt' -o -name '*.rst' \) \
      ! -path './.git/*' \
      ! -path './node_modules/*' \
      ! -path './dist/*' \
      ! -path './build/*' \
      ! -path './.next/*' \
      ! -path './coverage/*' \
      ! -path './venv/*' \
      ! -path './.venv/*' \
      ! -path './_legacy/*' \
      ! -path './Drive/*' \
      ! -name 'AGENTS.md' \
      | sed 's#^\./##' \
      | sort
  )
}

audit_file() {
  local repo_dir="$1"
  local rel="$2"
  local abs="$repo_dir/$rel"
  local now_epoch
  local age_days
  local status="ACTIVE"
  local reasons=()

  now_epoch="$(date -u '+%s')"
  age_days="$(( (now_epoch - $(file_mtime_epoch "$abs")) / 86400 ))"

  if printf '%s' "$rel" | rg -qi '(legacy|archive|deprecated|obsolete|old|backup)'; then
    status="REVIEW"
    reasons+=("legacy_path_pattern")
  fi

  if [ "$age_days" -gt "$STALE_DAYS" ]; then
    status="REVIEW"
    reasons+=("older_than_${STALE_DAYS}d")
  fi

  if [ ! -s "$abs" ]; then
    status="REVIEW"
    reasons+=("empty_file")
  fi

  if [ "${#reasons[@]}" -eq 0 ]; then
    echo "$status|none|$age_days"
  else
    local joined
    joined="$(IFS=','; echo "${reasons[*]}")"
    echo "$status|$joined|$age_days"
  fi
}

write_project_agents_md() {
  local repo_dir="$1"
  local repo_key="$2"
  local doc_id="$3"
  local notebook_id="$4"

  cat > "$repo_dir/AGENTS.md" <<EOF
# Project Agent Protocol: Google-Doc-Only Kernel

## Project Identity
- repo_key: \`$repo_key\`
- PROJECT_GOOGLE_DOC_ID: \`$doc_id\`
- PROJECT_NOTEBOOK_ID: \`$notebook_id\`

## Hard Rules
1. Do not create local documentation files (\`*.md\`, \`*.txt\`, \`*.docx\`) except this \`AGENTS.md\`.
2. All documentation updates go to the single Master Google Doc via service account/API.
3. Before architecture or code changes, query NotebookLM and require citation evidence.
4. If citations are missing or access fails, return \`BLOCKED\` and stop.
5. High-risk actions require explicit human approval.

## Mandatory Queries
\`\`\`bash
nlm notebook query "$PROJECT_NOTEBOOK_ID" "Welche <critical_invariant> und <halt_condition> gelten fuer Modul <MODULE>?" --json
nlm notebook query "$PROJECT_NOTEBOOK_ID" "Welche Artefakte fehlen fuer Modul <MODULE> bis Definition of Done?" --json
\`\`\`

## Documentation Workflow
1. Read/update project docs only in Google Doc tabs.
2. Keep NotebookLM source bound to this Google Doc.
3. After doc updates, run source sync:
\`\`\`bash
nlm source sync "$PROJECT_NOTEBOOK_ID" --confirm
\`\`\`

## Guardrail
If any mandatory rule cannot be proven with notebook citations: \`BLOCKED\`.
EOF
}

REPO_KEY="$(resolve_repo_key_by_target "$TARGET")"
load_repo_paths
REPO_DIR="$(resolve_repo_dir "$REPO_KEY" "$TARGET")"
if [ -z "$REPO_KEY" ]; then
  REPO_KEY="$(normalize_key "$(basename "$REPO_DIR")")"
fi
DOC_ID="$(resolve_doc_id "$REPO_KEY")"
NOTEBOOK_ID="$(resolve_notebook_id "$REPO_KEY")"

if [ -z "$DOC_ID" ] || [ "$DOC_ID" = "null" ]; then
  DOC_ID=""
fi

if [ -z "$NOTEBOOK_ID" ] || [ "$NOTEBOOK_ID" = "null" ]; then
  NOTEBOOK_ID=""
fi

if [ -z "$DOC_TITLE" ]; then
  DOC_TITLE="AIOMETRICS ${REPO_KEY} Master Kernel"
fi

echo "Google-Doc Kernel Sync"
echo "mode=$MODE"
echo "target=$TARGET"
echo "repo_key=$REPO_KEY"
echo "repo_dir=$REPO_DIR"
echo "doc_id=${DOC_ID:-<missing>}"
echo "notebook_id=${NOTEBOOK_ID:-<missing>}"
echo "create_doc_if_missing=$CREATE_DOC"
echo "write_agents_md=$WRITE_AGENTS_MD"
echo "delete_local_docs=$DELETE_LOCAL_DOCS"
echo "enforce_single_source=$ENFORCE_SINGLE_SOURCE"
echo "sync_notebook=$SYNC_NOTEBOOK"
echo

if [ "$WRITE_AGENTS_MD" = "1" ]; then
  if [ "$MODE" = "dry-run" ]; then
    echo "DRY-RUN: would write $REPO_DIR/AGENTS.md"
  else
    write_project_agents_md "$REPO_DIR" "$REPO_KEY" "${DOC_ID:-PENDING_DOC_ID}" "${NOTEBOOK_ID:-PENDING_NOTEBOOK_ID}"
    echo "OK: wrote $REPO_DIR/AGENTS.md"
  fi
fi

mapfile -t FILES < <(discover_doc_files "$REPO_DIR")
if [ "${#FILES[@]}" -eq 0 ]; then
  echo "WARN: no local docs found for migration"
fi

AUDIT_TSV="$(mktemp)"
trap 'rm -f "$AUDIT_TSV"' EXIT

for rel in "${FILES[@]}"; do
  audit="$(audit_file "$REPO_DIR" "$rel")"
  printf '%s\t%s\n' "$rel" "$audit" >> "$AUDIT_TSV"
done

if [ "${#FILES[@]}" -gt 0 ]; then
  echo "Audit Summary:"
  awk -F'\t|\\|' '
    {total+=1; if ($2=="ACTIVE") active+=1; else review+=1}
    END {
      printf("  total=%d active=%d review=%d\n", total, active, review)
    }
  ' "$AUDIT_TSV"
fi

if [ "$MODE" = "dry-run" ]; then
  if [ -n "$DOC_ID" ]; then
    echo "DRY-RUN: would migrate into Google Doc $DOC_ID"
  else
    echo "DRY-RUN: Google Doc ID missing; set PROJECT_GOOGLE_DOC_ID or config mapping"
  fi
  echo
  echo "Planned tab mapping:"
  echo "  - 00_INDEX"
  awk -F'\t|\\|' '{printf("  - %s\n", $1)}' "$AUDIT_TSV"
else
  TOKEN="$(resolve_token)"

  if [ -z "$DOC_ID" ]; then
    if [ "$CREATE_DOC" = "1" ]; then
      created="$(api_doc_create "$TOKEN" "$DOC_TITLE")"
      DOC_ID="$(printf '%s' "$created" | jq -r '.documentId')"
      if [ -z "$DOC_ID" ] || [ "$DOC_ID" = "null" ]; then
        echo "ERROR: failed to create Google Doc" >&2
        exit 4
      fi
      echo "OK: created Google Doc id=$DOC_ID"
      echo "URL: https://docs.google.com/document/d/$DOC_ID/edit"
    else
      echo "ERROR: PROJECT_GOOGLE_DOC_ID missing and CREATE_GOOGLE_DOC_IF_MISSING=0" >&2
      exit 4
    fi
  fi

  DOC_JSON="$(api_doc_get "$TOKEN" "$DOC_ID")"

  INDEX_CONTENT="# PROJECT_KERNEL_INDEX\n\n"
  INDEX_CONTENT+="generated_at: $(date -u '+%Y-%m-%dT%H:%M:%SZ')\n"
  INDEX_CONTENT+="repo_key: $REPO_KEY\n"
  INDEX_CONTENT+="repo_dir: $REPO_DIR\n"
  INDEX_CONTENT+="stale_threshold_days: $STALE_DAYS\n\n"
  INDEX_CONTENT+="## Files\n"

  index_tab_id="$(ensure_tab "$TOKEN" "$DOC_ID" "00_INDEX" "$DOC_JSON")"
  if [ -z "$index_tab_id" ]; then
    DOC_JSON="$(api_doc_get "$TOKEN" "$DOC_ID")"
    index_tab_id="$(tab_id_by_title "$DOC_JSON" "00_INDEX")"
  fi

  i=0
  while IFS=$'\t' read -r rel meta; do
    [ -n "$rel" ] || continue
    status="$(printf '%s' "$meta" | cut -d'|' -f1)"
    reasons="$(printf '%s' "$meta" | cut -d'|' -f2)"
    age_days="$(printf '%s' "$meta" | cut -d'|' -f3)"

    tab_title="$(sanitize_tab_title "$rel")"
    DOC_JSON="$(api_doc_get "$TOKEN" "$DOC_ID")"
    tab_id="$(ensure_tab "$TOKEN" "$DOC_ID" "$tab_title" "$DOC_JSON")"
    if [ -z "$tab_id" ]; then
      DOC_JSON="$(api_doc_get "$TOKEN" "$DOC_ID")"
      tab_id="$(tab_id_by_title "$DOC_JSON" "$tab_title")"
    fi

    if [ -z "$tab_id" ]; then
      echo "WARN: could not resolve tab for $rel" >&2
      continue
    fi

    end_index="$(tab_end_index_by_id "$DOC_JSON" "$tab_id")"
    clear_tab_text "$TOKEN" "$DOC_ID" "$tab_id" "$end_index"

    file_abs="$REPO_DIR/$rel"
    file_text="$(cat "$file_abs")"
    if [ "${#file_text}" -gt "$MAX_FILE_CHARS" ]; then
      file_text="${file_text:0:$MAX_FILE_CHARS}\n\n[TRUNCATED: exceeded MAX_FILE_CHARS=$MAX_FILE_CHARS]"
    fi

    migrated_text="<source_file path=\"$rel\">\n"
    migrated_text+="<last_modified_utc>$(file_mtime_iso "$file_abs")</last_modified_utc>\n"
    migrated_text+="<audit_status>$status</audit_status>\n"
    migrated_text+="<audit_reasons>$reasons</audit_reasons>\n"
    migrated_text+="<age_days>$age_days</age_days>\n"
    migrated_text+="</source_file>\n\n"
    migrated_text+="$file_text"

    insert_tab_text "$TOKEN" "$DOC_ID" "$tab_id" "$migrated_text"
    i=$((i + 1))

    INDEX_CONTENT+="- $rel | status=$status | reasons=$reasons | age_days=$age_days\n"
  done < "$AUDIT_TSV"

  if [ -n "$index_tab_id" ]; then
    DOC_JSON="$(api_doc_get "$TOKEN" "$DOC_ID")"
    index_end="$(tab_end_index_by_id "$DOC_JSON" "$index_tab_id")"
    clear_tab_text "$TOKEN" "$DOC_ID" "$index_tab_id" "$index_end"
    insert_tab_text "$TOKEN" "$DOC_ID" "$index_tab_id" "$INDEX_CONTENT"
  fi

  echo "OK: migrated $i file tabs into Google Doc $DOC_ID"
fi

if [ "$SYNC_NOTEBOOK" = "1" ]; then
  if [ -z "$NOTEBOOK_ID" ]; then
    echo "WARN: notebook_id is missing; skip NotebookLM binding"
  else
    if [ "$MODE" = "dry-run" ]; then
      echo "DRY-RUN: would ensure NotebookLM source drive:$DOC_ID in notebook:$NOTEBOOK_ID"
    else
      sources_json="$(run_nlm source list "$NOTEBOOK_ID" --json)"
      mapfile -t drive_source_ids < <(printf '%s' "$sources_json" | jq -r --arg doc "$DOC_ID" '.[] | select(((.url // "") | contains($doc))) | .id')

      if [ "${#drive_source_ids[@]}" -eq 0 ]; then
        echo "NotebookLM: adding drive source doc_id=$DOC_ID"
        run_nlm source add "$NOTEBOOK_ID" --drive "$DOC_ID" --type doc --wait >/dev/null
        sources_json="$(run_nlm source list "$NOTEBOOK_ID" --json)"
        mapfile -t drive_source_ids < <(printf '%s' "$sources_json" | jq -r --arg doc "$DOC_ID" '.[] | select(((.url // "") | contains($doc))) | .id')
      fi

      if [ "$ENFORCE_SINGLE_SOURCE" = "1" ]; then
        mapfile -t non_drive_ids < <(
          printf '%s' "$sources_json" \
            | jq -r --arg doc "$DOC_ID" '.[] | select((((.url // "") | contains($doc)) | not)) | .id'
        )
        if [ "${#non_drive_ids[@]}" -gt 0 ]; then
          echo "NotebookLM: deleting ${#non_drive_ids[@]} non-kernel sources"
          run_nlm source delete "${non_drive_ids[@]}" --confirm >/dev/null
        fi
      fi

      run_nlm source sync "$NOTEBOOK_ID" --confirm >/dev/null || true
      echo "OK: notebook source binding updated for notebook=$NOTEBOOK_ID"
    fi
  fi
fi

if [ "$DELETE_LOCAL_DOCS" = "1" ]; then
  if [ "$CONFIRM_DELETE" != "YES_DELETE_LOCAL_DOCS" ]; then
    echo "ERROR: DELETE_LOCAL_DOCS=1 requires CONFIRM_DELETE=YES_DELETE_LOCAL_DOCS" >&2
    exit 5
  fi

  if [ "$MODE" = "dry-run" ]; then
    echo "DRY-RUN: would delete ACTIVE local docs (excluding AGENTS.md)"
  else
    deleted=0
    while IFS=$'\t' read -r rel meta; do
      [ -n "$rel" ] || continue
      status="$(printf '%s' "$meta" | cut -d'|' -f1)"
      if [ "$status" = "ACTIVE" ]; then
        rm -f "$REPO_DIR/$rel"
        deleted=$((deleted + 1))
      fi
    done < "$AUDIT_TSV"
    echo "OK: deleted $deleted ACTIVE local docs"
  fi
fi

if [ -n "$DOC_ID" ]; then
  echo
  echo "Project Master Doc:"
  echo "  id=$DOC_ID"
  echo "  url=https://docs.google.com/document/d/$DOC_ID/edit"
fi

echo "Done."
