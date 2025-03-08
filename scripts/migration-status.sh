#!/bin/bash

# Script to check the status of TypeScript migration
# Usage: ./scripts/migration-status.sh

# Navigate to the project root
cd "$(dirname "$0")/.." || exit

echo "TypeScript Migration Status"
echo "=========================="
echo

# Count JavaScript and TypeScript files
JS_FILES=$(find src -name "*.js" | wc -l)
TS_FILES=$(find src -name "*.ts" | wc -l)
TOTAL_FILES=$((JS_FILES + TS_FILES))
TS_PERCENTAGE=$((TS_FILES * 100 / TOTAL_FILES))

echo "Progress: $TS_FILES/$TOTAL_FILES files migrated ($TS_PERCENTAGE%)"
echo

# Count by directory
echo "Migration Status by Directory:"
echo "-----------------------------"

# List directories
DIRS=$(find src -type d | sort)

for DIR in $DIRS; do
  if [ "$DIR" == "src" ]; then
    continue
  fi
  
  JS_COUNT=$(find "$DIR" -maxdepth 1 -name "*.js" | wc -l)
  TS_COUNT=$(find "$DIR" -maxdepth 1 -name "*.ts" | wc -l)
  DIR_TOTAL=$((JS_COUNT + TS_COUNT))
  
  if [ "$DIR_TOTAL" -gt 0 ]; then
    DIR_PERCENTAGE=$((TS_COUNT * 100 / DIR_TOTAL))
    printf "%-25s %3d/%d files (%3d%%)\n" "$DIR" "$TS_COUNT" "$DIR_TOTAL" "$DIR_PERCENTAGE"
  fi
done

echo
echo "JavaScript Files Still Needing Migration:"
echo "---------------------------------------"
find src -name "*.js" | sort

echo
echo "To migrate a file, use: ./scripts/js-to-ts.sh <path/to/file.js>" 