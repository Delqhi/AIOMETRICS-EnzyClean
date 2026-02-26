#!/usr/bin/env bash
set -euo pipefail

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

npm --prefix website-next ci
npm --prefix website-next run lint
npm --prefix website-next run typecheck
npm --prefix website-next run build

# Run from repo root so Vercel rootDirectory=website-next resolves correctly.
vercel --prod
