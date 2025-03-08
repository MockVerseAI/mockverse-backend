#!/bin/bash

# Script to help migrate JavaScript files to TypeScript
# Usage: ./scripts/js-to-ts.sh <path/to/file.js>

# Check if file path is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <path/to/file.js>"
  exit 1
fi

# Check if file exists
if [ ! -f "$1" ]; then
  echo "Error: File $1 does not exist"
  exit 1
fi

# Check if file is a JavaScript file
if [[ "$1" != *.js ]]; then
  echo "Error: File must be a JavaScript file (.js extension)"
  exit 1
fi

# Get the TypeScript file path
TS_FILE="${1%.js}.ts"

# Check if TypeScript file already exists
if [ -f "$TS_FILE" ]; then
  echo "Error: TypeScript file $TS_FILE already exists"
  exit 1
fi

# Copy JavaScript file to TypeScript file
cp "$1" "$TS_FILE"

echo "Created TypeScript file: $TS_FILE"
echo "Next steps:"
echo "1. Edit the TypeScript file to add types"
echo "2. Ensure all imports have .js extensions"
echo "3. Run 'npm run typecheck' to check for type errors"
echo "4. Once TypeScript file is working, you can remove the JavaScript file" 