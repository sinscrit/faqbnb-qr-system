#!/usr/bin/env bash

set -euo pipefail

generated_types_path="src/types/database.generated.ts"
generated_types_tmp="$(mktemp "src/types/.database.generated.ts.XXXXXX")"

cleanup() {
  rm -f "$generated_types_tmp"
}
trap cleanup EXIT

supabase gen types typescript --local --schema public > "$generated_types_tmp"

if [[ ! -s "$generated_types_tmp" ]]; then
  echo "Supabase generated an empty database type file" >&2
  exit 1
fi

node -e '
const fs = require("node:fs");
const path = process.argv[1];
const generated = fs.readFileSync(path, "utf8");
const normalized = generated.replace(/[\r\n]+$/u, "");
if (normalized.length === 0) {
  throw new Error("Supabase generated no database type content");
}
fs.writeFileSync(path, `${normalized}\n`, "utf8");
' "$generated_types_tmp"

if [[ ! -s "$generated_types_tmp" ]]; then
  echo "Supabase generated an empty database type file after normalization" >&2
  exit 1
fi

mv "$generated_types_tmp" "$generated_types_path"
trap - EXIT

echo "Generated $generated_types_path from the local Supabase database"
