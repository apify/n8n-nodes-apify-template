#!/usr/bin/env bash
set -e

# Targets
TARGET_CLASS_NAME="ApifyContentCrawler"
TARGET_PACKAGE_NAME="n8n-nodes-apify-content-crawler"

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
OLD_DIR="./nodes/$TARGET_CLASS_NAME"
NEW_DIR="./nodes/$CLASS_NAME"

if [[ -d "$OLD_DIR" ]]; then
  if [[ -e "$NEW_DIR" ]]; then
    echo "Target '$NEW_DIR' already exists — skipping dir rename."
  else
    git mv "$OLD_DIR" "$NEW_DIR" 2>/dev/null || mv "$OLD_DIR" "$NEW_DIR"
    echo "Renamed folder: nodes/$TARGET_CLASS_NAME -> nodes/$CLASS_NAME"
  fi

  # Rename files inside the new folder: <TARGET_CLASS_NAME>.* -> <CLASS_NAME>.*
  for ext in methods.ts node.json node.ts properties.ts; do
    if [[ -f "$NEW_DIR/$TARGET_CLASS_NAME.$ext" ]]; then
      git mv "$NEW_DIR/$TARGET_CLASS_NAME.$ext" "$NEW_DIR/$CLASS_NAME.$ext" 2>/dev/null \
        || mv "$NEW_DIR/$TARGET_CLASS_NAME.$ext" "$NEW_DIR/$CLASS_NAME.$ext"
    fi
  done
  echo "Renamed files inside nodes/$CLASS_NAME"
else
  echo "Warning: $OLD_DIR not found (skipped)."
fi
