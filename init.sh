#!/usr/bin/env bash
set -e

# Variables
NEW_NAME="renamed-package"
CLASS_NAME="RenamedPackage"

#############################################
# Edit package.json fields
#############################################
jq --arg n "$NEW_NAME" --arg c "$CLASS_NAME" '
  .name = "@apify/" + $n
  | .homepage |= sub("[^/]+$"; $n)
  | .repository.url |= sub("[^/]+\\.git$"; $n + ".git")
  | .n8n.nodes |= map(sub("ApifyContentCrawler/ApifyContentCrawler"; "\($c)/\($c)"))
' package.json > tmp.$$.json && mv tmp.$$.json package.json

echo "Updated package.json:"
echo "- name → @apify/$NEW_NAME"
echo "- homepage and repository URL"
echo "- n8n.nodes paths → $CLASS_NAME/$CLASS_NAME.node.js"

#############################################
# Edit Project Structure
#############################################
OLD_DIR="./nodes/ApifyContentCrawler"
NEW_DIR="./nodes/$CLASS_NAME"

if [[ -d "$OLD_DIR" ]]; then
  # Rename files inside the folder
  for file in "$OLD_DIR"/ApifyContentCrawler.*; do
    new_file="${file/ApifyContentCrawler/$CLASS_NAME}"
    git mv "$file" "$new_file" 2>/dev/null || mv "$file" "$new_file"
  done

  # Rename the folder
  git mv "$OLD_DIR" "$NEW_DIR" 2>/dev/null || mv "$OLD_DIR" "$NEW_DIR"
  echo "Renamed folder and files: ApifyContentCrawler -> $CLASS_NAME"
else
  echo "Warning: $OLD_DIR not found (skipped)."
fi
