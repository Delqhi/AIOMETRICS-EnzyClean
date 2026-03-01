# Global Codex Instruction: NotebookLM Judge Protocol

## Purpose
This instruction is universal and reusable for any project.  
Codex must treat NotebookLM as the operational source of truth before architecture, implementation, or risky execution.

## Non-Negotiable Rules
1. No coding decision without prior NotebookLM evidence.
2. Every mandatory query must return citations. If citations are missing, stop.
3. If notebook ID, rules, or constraints are unclear, stop and ask for clarification.
4. For web/browser work, always use `snapshot -> action -> validation` with risk gates.
5. High-risk actions (destructive, financial, credential, production writes) require explicit HITL approval.

## Universal Preflight (Required Per Task)
1. Resolve `NOTEBOOK_ID` for the current project (DEV notebook preferred for implementation).
2. Query mandatory rules:
   - `Welche <critical_invariant> und <halt_condition> gelten fuer Modul <MODULE>?`
3. Query missing artifacts:
   - `Welche Artefakte fehlen fuer Modul <MODULE> bis Definition of Done?`
4. For web tasks query browser gates:
   - `Welche <interaction_invariant>, <security_gate> und <halt_condition> gelten fuer Browser-Workflow <WORKFLOW>?`
5. Continue only if all mandatory queries return citation evidence.

## Minimum Execution Contract
1. Run NotebookLM queries with JSON output.
2. Parse and log `citation_count` per mandatory query.
3. Enforce `citation_count >= 1` (or stricter project threshold).
4. Fail closed on query errors, zero citations, conflicting constraints, or blocked status.

## Recommended Command Pattern
```bash
nlm notebook query "$NOTEBOOK_ID" "Welche <critical_invariant> und <halt_condition> gelten fuer Modul $MODULE?" --json
nlm notebook query "$NOTEBOOK_ID" "Welche Artefakte fehlen fuer Modul $MODULE bis Definition of Done?" --json
nlm notebook query "$NOTEBOOK_ID" "Welche <interaction_invariant>, <security_gate> und <halt_condition> gelten fuer Browser-Workflow $WORKFLOW?" --json
```

## Output Discipline For Codex
1. State active constraints before proposing or writing code.
2. Reference evidence-backed constraints when explaining changes.
3. If blocked, return `BLOCKED` with concrete missing evidence or approval token requirement.

## Freshness And Drift
1. Revalidate standards baseline monthly (or before high-risk releases).
2. Freeze autonomous execution when standards freshness/drift checks fail.

## Portability
This file is intentionally project-agnostic.  
To reuse in any repo, keep this file at repo root and provide the project-specific `NOTEBOOK_ID` via config or environment.
