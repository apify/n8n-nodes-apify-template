#!/usr/bin/env bash
set -e

# Variables
ACTOR_ID="aYG0l9s7dbB7j3gbS"
PACKAGE_NAME="renamed-package"
CLASS_NAME="RenamedPackage"
X_PLATFORM_HEADER_ID="X-Platform-Header-ID"
X_PLATFORM_APP_HEADER_ID="X-Platform-App-Header-ID"
DISPLAY_NAME="Actor Display Name"

# Cross-platform sed -i (macOS vs Linux)
if [[ "$(uname)" == "Darwin" ]]; then
  SED_INPLACE=(-i '')
else
  SED_INPLACE=(-i)
fi

#############################################
# Create .env
#############################################
tmp_env=".env.$$.tmp"
{
  printf 'PACKAGE_NAME=%s\n' "$PACKAGE_NAME"
  printf 'CLASS_NAME=%s\n' "$CLASS_NAME"
  printf 'ACTOR_ID=%s\n' "$ACTOR_ID"
  printf 'X_PLATFORM_HEADER_ID=%s\n' "$X_PLATFORM_HEADER_ID"
  printf 'X_PLATFORM_APP_HEADER_ID=%s\n' "$X_PLATFORM_APP_HEADER_ID"
  printf 'DISPLAY_NAME=%s\n' "$DISPLAY_NAME"
} > "$tmp_env"
mv "$tmp_env" .env
echo "Wrote .env with PACKAGE_NAME, CLASS_NAME, ACTOR_ID, headers, and display name."

#############################################
# Edit package.json fields
#############################################
jq --arg n "$PACKAGE_NAME" --arg c "$CLASS_NAME" '
  .name = "@apify/" + $n
  | .homepage |= sub("[^/]+$"; $n)
  | .repository.url |= sub("[^/]+\\.git$"; $n + ".git")
  | .n8n.nodes |= map(sub("ApifyContentCrawler/ApifyContentCrawler"; "\($c)/\($c)"))
' package.json > tmp.$$.json && mv tmp.$$.json package.json

echo "Updated package.json:"
echo "- name → @apify/$PACKAGE_NAME"
echo "- homepage and repository URL"
echo "- n8n.nodes paths → $CLASS_NAME/$CLASS_NAME.node.js"

#############################################
# Edit Config Files
#############################################

# Config File 1 (Node property in JSON)
CF1="./nodes/ApifyContentCrawler/ApifyContentCrawler.node.json"
if [[ -f "$CF1" ]]; then
  sed "${SED_INPLACE[@]}" "s#\"node\": \"n8n-nodes-apify-content-crawler\"#\"node\": \"$PACKAGE_NAME\"#" "$CF1"
  echo "Edited node property in: $CF1"
else
  echo "Warning: $CF1 not found (skipped)."
fi

# Config File 2 (tsconfig.json exclude path)
CF2="./tsconfig.json"
if [[ -f "$CF2" ]]; then
  sed "${SED_INPLACE[@]}" "s#nodes/ApifyContentCrawler/__tests__#nodes/$CLASS_NAME/__tests__#" "$CF2"
  echo "Edited exclude path in: $CF2"
else
  echo "Warning: $CF2 not found (skipped)."
fi

# Config File 3 (.eslintrc.js ignorePatterns)
CF3="./.eslintrc.js"
if [[ -f "$CF3" ]]; then
  sed "${SED_INPLACE[@]}" "s#nodes/ApifyContentCrawler/__tests__#nodes/$CLASS_NAME/__tests__#" "$CF3"
  echo "Edited ignorePatterns path in: $CF3"
else
  echo "Warning: $CF3 not found (skipped)."
fi

# Config File 4 (nodes.config.js packageName)
CF4="./nodes.config.js"
if [[ -f "$CF4" ]]; then
  sed "${SED_INPLACE[@]}" "s#packageName: 'n8n-nodes-apify-content-crawler'#packageName: '$PACKAGE_NAME'#" "$CF4"
  echo "Edited packageName in: $CF4"
else
  echo "Warning: $CF4 not found (skipped)."
fi

#############################################
# Edit Imports
#############################################

# File 1 (Generic functions imports)
F1="./nodes/ApifyContentCrawler/resources/genericFunctions.ts"
if [[ -f "$F1" ]]; then
  sed "${SED_INPLACE[@]}" "s#\\./\\.\\./ApifyContentCrawler\\.node#./../$CLASS_NAME.node#g" "$F1" # (safety no-op)
  sed "${SED_INPLACE[@]}" "s#\\.\\./ApifyContentCrawler\\.node#../$CLASS_NAME.node#g" "$F1"
  echo "Edited imports in: $F1"
else
  echo "Warning: $F1 not found (skipped)."
fi

# File 2 (Tests imports)
F2="./nodes/ApifyContentCrawler/__tests__/nodeTypesClass.ts"
if [[ -f "$F2" ]]; then
  # Update the path
  sed "${SED_INPLACE[@]}" "s#\\.\\./\\.\\./ApifyContentCrawler\\.node#../../$CLASS_NAME.node#g" "$F2"
  # Update the imported identifier ApifyContentCrawler -> $CLASS_NAME (only on import line)
  sed "${SED_INPLACE[@]}" "s#^\\s*import\\s*{\\s*ApifyContentCrawler,#import { $CLASS_NAME,#" "$F2"
  echo "Edited imports in: $F2"
else
  echo "Warning: $F2 not found (skipped)."
fi

# File 3 (Advanced mode imports)
F3="./nodes/ApifyContentCrawler/resources/actors/run-actor-advanced/execute.ts"
if [[ -f "$F3" ]]; then
  sed "${SED_INPLACE[@]}" "s#\\.\\.\\/\\.\\.\\/\\.\\.\\/ApifyContentCrawler\\.node#../../../$CLASS_NAME.node#g" "$F3" # (safety no-op)
  sed "${SED_INPLACE[@]}" "s#\\.\\.\\/\\.\\.\\/ApifyContentCrawler\\.node#../../$CLASS_NAME.node#g" "$F3"         # (safety no-op)
  sed "${SED_INPLACE[@]}" "s#\\.\\.\\/\\.\\.\\/\\.\\.\\/ApifyContentCrawler\\.node#../../../$CLASS_NAME.node#g" "$F3"
  sed "${SED_INPLACE[@]}" "s#\\.\\.\\/\\.\\.\\/ApifyContentCrawler\\.node#../../$CLASS_NAME.node#g" "$F3"
  sed "${SED_INPLACE[@]}" "s#\\.\\.\\/\\.\\.\\/\\.\\.\\/ApifyContentCrawler\\.node#../../../$CLASS_NAME.node#g" "$F3" >/dev/null 2>&1 || true
  sed "${SED_INPLACE[@]}" "s#\\.\\.\\/\\.\\.\\/ApifyContentCrawler\\.node#../../$CLASS_NAME.node#g" "$F3" >/dev/null 2>&1 || true
  # The exact given code has '../../../ApifyContentCrawler.node'
  sed "${SED_INPLACE[@]}" "s#\\.\\.\\/\\.\\.\\/\\.\\.\\/ApifyContentCrawler\\.node#../../../$CLASS_NAME.node#g" "$F3"
  echo "Edited imports in: $F3"
else
  echo "Warning: $F3 not found (skipped)."
fi

# File 4 (Standard mode imports)
F4="./nodes/ApifyContentCrawler/resources/actors/run-actor-standard/execute.ts"
if [[ -f "$F4" ]]; then
  sed "${SED_INPLACE[@]}" "s#\\.\\.\\/\\.\\.\\/\\.\\.\\/ApifyContentCrawler\\.node#../../../$CLASS_NAME.node#g" "$F4"
  echo "Edited imports in: $F4"
else
  echo "Warning: $F4 not found (skipped)."
fi

# File 5 (Node imports in .node.ts)
F5="./nodes/ApifyContentCrawler/ApifyContentCrawler.node.ts"
if [[ -f "$F5" ]]; then
  sed "${SED_INPLACE[@]}" "s#'\\.\\/ApifyContentCrawler\\.properties'#'./$CLASS_NAME.properties'#" "$F5"
  sed "${SED_INPLACE[@]}" "s#'\\.\\/ApifyContentCrawler\\.methods'#'./$CLASS_NAME.methods'#" "$F5"
  echo "Edited imports in: $F5"
else
  echo "Warning: $F5 not found (skipped)."
fi

#############################################
# Edit Project Structure (rename folder and files)
#############################################
OLD_DIR="./nodes/ApifyContentCrawler"
NEW_DIR="./nodes/$CLASS_NAME"

if [[ -d "$OLD_DIR" ]]; then
  if [[ -e "$NEW_DIR" ]]; then
    echo "Error: target folder '$NEW_DIR' already exists. Remove it or choose a different CLASS_NAME." >&2
    exit 1
  fi

  # 1) Rename the folder first (atomic dir rename)
  git mv "$OLD_DIR" "$NEW_DIR" 2>/dev/null || mv "$OLD_DIR" "$NEW_DIR"
  echo "Renamed folder: nodes/ApifyContentCrawler -> nodes/$CLASS_NAME"

  # 2) Rename files inside the renamed folder
  git mv "$NEW_DIR/ApifyContentCrawler.methods.ts"    "$NEW_DIR/$CLASS_NAME.methods.ts"    2>/dev/null || mv "$NEW_DIR/ApifyContentCrawler.methods.ts"    "$NEW_DIR/$CLASS_NAME.methods.ts"
  git mv "$NEW_DIR/ApifyContentCrawler.node.json"     "$NEW_DIR/$CLASS_NAME.node.json"     2>/dev/null || mv "$NEW_DIR/ApifyContentCrawler.node.json"     "$NEW_DIR/$CLASS_NAME.node.json"
  git mv "$NEW_DIR/ApifyContentCrawler.node.ts"       "$NEW_DIR/$CLASS_NAME.node.ts"       2>/dev/null || mv "$NEW_DIR/ApifyContentCrawler.node.ts"       "$NEW_DIR/$CLASS_NAME.node.ts"
  git mv "$NEW_DIR/ApifyContentCrawler.properties.ts" "$NEW_DIR/$CLASS_NAME.properties.ts" 2>/dev/null || mv "$NEW_DIR/ApifyContentCrawler.properties.ts" "$NEW_DIR/$CLASS_NAME.properties.ts"

  echo "Renamed files inside nodes/$CLASS_NAME: ApifyContentCrawler.* -> $CLASS_NAME.*"
else
  echo "Warning: $OLD_DIR not found (skipped)."
fi
