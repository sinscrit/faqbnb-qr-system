#!/bin/bash

# Cleanup script for temporary test files
# This script removes all temporary files created during development and testing

echo "🧹 Starting cleanup of temporary files..."

# Define temporary file patterns
TEMP_FILES=(
    "test-*.js"
    "test-*.ts" 
    "test-*.json"
    "debug-*.js"
    "debug-*.ts"
    "temp-*.js"
    "temp-*.ts"
    "playwright-*.js"
    "*.temp.js"
    "*.temp.ts"
    "*.test.temp.js"
    "*.test.temp.ts"
)

# Count files to be deleted
total_files=0
for pattern in "${TEMP_FILES[@]}"; do
    files=$(find . -maxdepth 1 -name "$pattern" -type f 2>/dev/null || true)
    if [ -n "$files" ]; then
        count=$(echo "$files" | wc -l)
        total_files=$((total_files + count))
        echo "📋 Found $count file(s) matching: $pattern"
        echo "$files" | sed 's/^/  - /'
    fi
done

if [ $total_files -eq 0 ]; then
    echo "✅ No temporary files found to clean up."
    exit 0
fi

echo ""
echo "🗑️  Deleting $total_files temporary file(s)..."

deleted_count=0
for pattern in "${TEMP_FILES[@]}"; do
    files=$(find . -maxdepth 1 -name "$pattern" -type f 2>/dev/null || true)
    if [ -n "$files" ]; then
        echo "$files" | while read -r file; do
            if [ -f "$file" ]; then
                rm "$file"
                echo "  ✅ Deleted: $file"
                deleted_count=$((deleted_count + 1))
            fi
        done
    fi
done

echo ""
echo "🎉 Cleanup complete! Deleted $total_files temporary file(s)."
