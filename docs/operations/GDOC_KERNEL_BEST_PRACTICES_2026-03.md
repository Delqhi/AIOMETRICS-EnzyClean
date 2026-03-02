# Google-Doc Kernel Best Practices (March 2026)

## Zielbild
Pro Projekt gelten genau zwei SSOT-Komponenten:
1. Eine Master Google Doc Datei (mehrere Tabs, per API gepflegt).
2. Ein NotebookLM, das auf diese Master Google Doc Datei zeigt.

Lokal im Projekt bleibt nur `AGENTS.md` als Agentenprotokoll.

## Betriebsregeln
1. Keine lokale Projektdokumentation (`*.md`, `*.txt`, `*.docx`) außer `AGENTS.md`.
2. Änderungen an Architektur/Requirements/ADR/RFC/SRE ausschließlich in der Master Google Doc.
3. Vor Architektur- oder Coding-Entscheidungen immer NotebookLM-Queries mit Citations.
4. Ohne Citation-Evidence: `BLOCKED`.
5. High-Risk-Aktionen nur mit expliziter Human-Freigabe.

## Verbindliche Parent/Child-Tab-Struktur
- Parent `00_FOUNDATION`
  - `Agents.md`
  - `CONTEXT.md`
  - `readme.md`
- Parent `01_DESIGN`
  - `ARCHITECTURE.md`
  - `DESIGN.md`
- Parent `02_ENGINEERING`
  - `BACKEND.md`
  - `FRONTEND.md`
- Parent `03_INFRASTRUCTURE`
  - `VM.md`
  - `VERCEL.md`
  - `CLOUDFLARE.md`
- Parent `04_INTELLIGENCE`
  - `NOTEBOOKLM.md`
- Root tab `00_INDEX` als Navigations- und Audit-Übersicht.
- Zusätzlich: dynamische Child-Tabs pro migrierter Alt-Datei unter der passenden Parent-Kategorie.

## Umsetzung mit Dienstkonto
Voraussetzungen:
- Google Docs API + Google Drive API aktiv.
- Master Doc ist für die Dienstkonto-E-Mail freigegeben (Writer).
- Zugriff via `GOOGLE_SERVICE_ACCOUNT_KEY` oder OAuth Token Provider.

## Migration + Enforcement
Dry-run:
```bash
KERNEL_MODE=dry-run \
PROJECT_GOOGLE_DOC_ID="<DOC_ID>" \
PROJECT_NOTEBOOK_ID="<NOTEBOOK_ID>" \
PROJECT_GOOGLE_DRIVE_FOLDER_ID="<FOLDER_ID>" \
GOOGLE_SERVICE_ACCOUNT_KEY="/path/to/service-account.json" \
/Users/jeremyschulze/dev/AIOMETRICS/shared/scripts/gdoc-kernel-sync.sh <repo-key-or-path>
```

Sync:
```bash
KERNEL_MODE=sync \
PROJECT_GOOGLE_DOC_ID="<DOC_ID>" \
PROJECT_NOTEBOOK_ID="<NOTEBOOK_ID>" \
PROJECT_GOOGLE_DRIVE_FOLDER_ID="<FOLDER_ID>" \
GOOGLE_SERVICE_ACCOUNT_KEY="/path/to/service-account.json" \
ENFORCE_SINGLE_SOURCE=1 \
SYNC_NOTEBOOK=1 \
/Users/jeremyschulze/dev/AIOMETRICS/shared/scripts/gdoc-kernel-sync.sh <repo-key-or-path>
```

Autonomes Create (wenn `DOC_ID` fehlt):
```bash
KERNEL_MODE=sync \
CREATE_GOOGLE_DOC_IF_MISSING=1 \
PROJECT_GOOGLE_DOC_TITLE="AIOMETRICS <PROJECT> Master Kernel" \
PROJECT_GOOGLE_DRIVE_FOLDER_ID="<FOLDER_ID>" \
PROJECT_NOTEBOOK_ID="<NOTEBOOK_ID>" \
GOOGLE_SERVICE_ACCOUNT_KEY="/path/to/service-account.json" \
/Users/jeremyschulze/dev/AIOMETRICS/shared/scripts/gdoc-kernel-sync.sh <repo-key-or-path>
```

Optional harte Bereinigung:
```bash
KERNEL_MODE=sync \
DELETE_LOCAL_DOCS=1 \
CONFIRM_DELETE=YES_DELETE_LOCAL_DOCS \
PROJECT_GOOGLE_DOC_ID="<DOC_ID>" \
PROJECT_NOTEBOOK_ID="<NOTEBOOK_ID>" \
GOOGLE_SERVICE_ACCOUNT_KEY="/path/to/service-account.json" \
/Users/jeremyschulze/dev/AIOMETRICS/shared/scripts/gdoc-kernel-sync.sh <repo-key-or-path>
```

Lokale Policy-Prüfung:
```bash
GDOC_ONLY_MODE=report /Users/jeremyschulze/dev/AIOMETRICS/shared/scripts/enforce-gdoc-only-docs.sh <repo-path>
GDOC_ONLY_MODE=enforce /Users/jeremyschulze/dev/AIOMETRICS/shared/scripts/enforce-gdoc-only-docs.sh <repo-path>
```

## NotebookLM Sync-Hinweis
Nach Änderungen an Drive-Quellen sollte ein expliziter Sync-Schritt laufen:
```bash
nlm source sync "<NOTEBOOK_ID>" --confirm
```

## Minimaler Agentenprompt
```text
Nutze ausschließlich die Master Google Doc + das Projekt-NotebookLM als SSOT.
Erstelle keine lokalen Doku-Dateien außer AGENTS.md.
Vor jeder Entscheidung NotebookLM query mit --json und Citations.
Ohne Citations oder ohne Zugriff: BLOCKED.
```
