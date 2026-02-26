#!/usr/bin/env bash
set -euo pipefail

SKIP_BUILD="${SKIP_BUILD:-0}"

if ! command -v vercel >/dev/null 2>&1; then
  echo "vercel CLI missing. install: npm i -g vercel"
  exit 1
fi

if [ ! -f "website-next/package.json" ]; then
  echo "run this from repo root"
  exit 1
fi

if ! vercel whoami >/dev/null 2>&1; then
  echo "vercel auth missing/invalid. run: vercel login"
  exit 1
fi

# If root link is missing, bootstrap it from existing website link.
if [ ! -f ".vercel/project.json" ] && [ -f "website-next/.vercel/project.json" ]; then
  mkdir -p .vercel
  cp website-next/.vercel/project.json .vercel/project.json
fi

if [ ! -f ".vercel/project.json" ]; then
  echo "missing .vercel/project.json. run: (cd website-next && vercel link)"
  exit 1
fi

if [ "$SKIP_BUILD" != "1" ]; then
  npm --prefix website-next ci
  npm --prefix website-next run lint
  npm --prefix website-next run typecheck
  npm --prefix website-next run build
fi

# Non-interactive production deploy.
vercel --prod --yes
