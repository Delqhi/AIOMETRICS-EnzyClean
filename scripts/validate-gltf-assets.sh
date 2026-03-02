#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="$SCRIPT_DIR/../website-next/scripts/validate-gltf-assets.sh"

if [ ! -f "$TARGET" ]; then
  echo "Missing validator script: $TARGET"
  exit 1
fi

bash "$TARGET"
