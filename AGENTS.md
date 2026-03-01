# Global Codex Instruction: Google-Doc-Kernel + NotebookLM Judge Protocol

## Purpose
For each project there is exactly one Master Google Doc as documentation kernel and exactly one NotebookLM as judge context.
All coder agents must work against this kernel, not against local markdown documentation.

## Project Inputs (Required)
Set these values per project:
- `PROJECT_GOOGLE_DOC_ID`
- `PROJECT_NOTEBOOK_ID`
- `PROJECT_GOOGLE_DOC_URL` (optional but recommended)
- `GOOGLE_SERVICE_ACCOUNT_KEY` (path to service account key JSON) or equivalent access token provider

## Non-Negotiable Rules
1. Do not create or maintain local project documentation files (`*.md`, `*.txt`, `*.docx`) except `AGENTS.md`.
2. Write architecture, requirements, ADRs, RFCs, runbooks, and status only into the Master Google Doc.
3. No coding decision without prior NotebookLM evidence.
4. Every mandatory NotebookLM query must return citations; without citations return `BLOCKED`.
5. If notebook/doc IDs, auth, or constraints are unclear: stop and ask.
6. High-risk actions require explicit HITL approval.

## Universal Preflight (Required Per Task)
1. Verify access to Master Google Doc via service account/API.
2. Verify access to NotebookLM (`PROJECT_NOTEBOOK_ID`).
3. Query mandatory rules:
   - `Welche <critical_invariant> und <halt_condition> gelten fuer Modul <MODULE>?`
4. Query missing artifacts:
   - `Welche Artefakte fehlen fuer Modul <MODULE> bis Definition of Done?`
5. Continue only if mandatory queries return citation evidence.

## Google-Doc-Only Execution Contract
1. Read/update project documentation only in Master Google Doc tabs.
2. Migrate any existing local docs into Google Doc tabs before implementation.
3. After successful migration and audit confirmation, delete migrated local docs (except `AGENTS.md`).
4. Keep NotebookLM connected to this single Master Google Doc source.
5. Trigger source sync after document updates.

## Mandatory Query Pattern
```bash
nlm notebook query "$PROJECT_NOTEBOOK_ID" "Welche <critical_invariant> und <halt_condition> gelten fuer Modul $MODULE?" --json
nlm notebook query "$PROJECT_NOTEBOOK_ID" "Welche Artefakte fehlen fuer Modul $MODULE bis Definition of Done?" --json
```

## Output Discipline
1. State active constraints first.
2. Reference evidence-backed constraints in every plan/change.
3. If blocked, output `BLOCKED` with missing evidence, missing IDs, or missing approval token.

## Portability
This file is intentionally project-agnostic.
Use per-project IDs and service-account credentials at runtime.
