#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODELS_DIR="$SCRIPT_DIR/../public/models"

if [ ! -d "$MODELS_DIR" ]; then
  echo "No models directory found: $MODELS_DIR"
  exit 0
fi

mapfile -t model_files < <(find "$MODELS_DIR" -type f \( -name "*.glb" -o -name "*.gltf" \) | sort)

if [ "${#model_files[@]}" -eq 0 ]; then
  echo "No glTF/GLB files found in $MODELS_DIR"
  exit 0
fi

for file in "${model_files[@]}"; do
  echo "Validating $file"
  node - "$file" <<'NODE'
const fs = require('node:fs');
const path = require('node:path');
const validator = require('gltf-validator');

async function main(filePath) {
  const bytes = new Uint8Array(fs.readFileSync(filePath));
  const baseDir = path.dirname(filePath);
  const report = await validator.validateBytes(bytes, {
    maxIssues: 4096,
    externalResourceFunction: async (uri) => {
      if (typeof uri !== 'string' || /^https?:\/\//i.test(uri)) {
        return null;
      }

      const resolved = path.resolve(baseDir, uri);
      if (!fs.existsSync(resolved)) {
        return null;
      }

      return new Uint8Array(fs.readFileSync(resolved));
    }
  });

  const issues = report.issues || { numErrors: 0, numWarnings: 0, messages: [] };

  if (issues.numErrors > 0) {
    const lines = (issues.messages || [])
      .filter((message) => message && message.severity === 0)
      .slice(0, 10)
      .map((message) => `${message.code || 'ERROR'}: ${message.message || 'Unknown validation error'}`);

    const details = lines.length > 0 ? `\n${lines.join('\n')}` : '';
    throw new Error(`glTF validation failed for ${filePath}: ${issues.numErrors} error(s), ${issues.numWarnings} warning(s)${details}`);
  }

  console.log(`OK ${path.basename(filePath)} (warnings=${issues.numWarnings}, hints=${issues.numHints || 0})`);
}

main(process.argv[2]).catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
NODE
done

echo "glTF validation passed"
