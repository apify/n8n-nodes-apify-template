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
# Bulk Edit All Files (skip certain paths)
#############################################
TARGET_CLASS_NAME="ApifyContentCrawler"
TARGET_PACKAGE_NAME="n8n-nodes-apify-content-crawler"

SCRIPT_NAME="init.sh"

find . -type f \
  ! -name "$SCRIPT_NAME" \
  ! -path "*/node_modules/*" \
  ! -path "*/dist/*" \
  ! -path "*/docs/*" \
  ! -path "*/credentials/*" \
  ! -path "*/.git/*" | while read -r FILE; do
  # Edit only text-ish files, including JSON
  if file "$FILE" | grep -qE 'text|empty|JSON'; then
    sed "${SED_INPLACE[@]}" "s#$TARGET_CLASS_NAME#$CLASS_NAME#g" "$FILE"
    sed "${SED_INPLACE[@]}" "s#$TARGET_PACKAGE_NAME#$PACKAGE_NAME#g" "$FILE"
    echo "Edited: $FILE"
  fi
done
#############################################
# Edit Project Structure (rename folder and files)
#############################################
# OLD_DIR="./nodes/RenamedPackage"
# NEW_DIR="./nodes/$CLASS_NAME"

# if [[ -d "$OLD_DIR" ]]; then
#   if [[ -e "$NEW_DIR" ]]; then
#     echo "Error: target folder '$NEW_DIR' already exists. Remove it or choose a different CLASS_NAME." >&2
#     exit 1
#   fi

#   # 1) Rename the folder first (atomic dir rename)
#   git mv "$OLD_DIR" "$NEW_DIR" 2>/dev/null || mv "$OLD_DIR" "$NEW_DIR"
#   echo "Renamed folder: nodes/RenamedPackage -> nodes/$CLASS_NAME"

#   # 2) Rename files inside the renamed folder
#   git mv "$NEW_DIR/RenamedPackage.methods.ts"    "$NEW_DIR/$CLASS_NAME.methods.ts"    2>/dev/null || mv "$NEW_DIR/RenamedPackage.methods.ts"    "$NEW_DIR/$CLASS_NAME.methods.ts"
#   git mv "$NEW_DIR/RenamedPackage.node.json"     "$NEW_DIR/$CLASS_NAME.node.json"     2>/dev/null || mv "$NEW_DIR/RenamedPackage.node.json"     "$NEW_DIR/$CLASS_NAME.node.json"
#   git mv "$NEW_DIR/RenamedPackage.node.ts"       "$NEW_DIR/$CLASS_NAME.node.ts"       2>/dev/null || mv "$NEW_DIR/RenamedPackage.node.ts"       "$NEW_DIR/$CLASS_NAME.node.ts"
#   git mv "$NEW_DIR/RenamedPackage.properties.ts" "$NEW_DIR/$CLASS_NAME.properties.ts" 2>/dev/null || mv "$NEW_DIR/RenamedPackage.properties.ts" "$NEW_DIR/$CLASS_NAME.properties.ts"

#   echo "Renamed files inside nodes/$CLASS_NAME: RenamedPackage.* -> $CLASS_NAME.*"
# else
#   echo "Warning: $OLD_DIR not found (skipped)."
# fi
