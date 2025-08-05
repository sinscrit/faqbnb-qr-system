#!/bin/bash
# Script to modify .env.local values
# Usage: bash modify_env_values.sh KEY "VALUE"

if [ $# -ne 2 ]; then
    echo "Usage: bash modify_env_values.sh KEY \"VALUE\""
    exit 1
fi

KEY="$1"
VALUE="$2"
ENV_FILE=".env.local"

echo "🔧 Modifying $KEY in $ENV_FILE"

# Create backup
cp "$ENV_FILE" "$ENV_FILE.backup"

# Remove existing key (if it exists) and add new one
grep -v "^$KEY=" "$ENV_FILE" > "$ENV_FILE.tmp"
echo "$KEY=$VALUE" >> "$ENV_FILE.tmp"
mv "$ENV_FILE.tmp" "$ENV_FILE"

echo "✅ Successfully updated $KEY"
echo "📋 New value length: ${#VALUE}"