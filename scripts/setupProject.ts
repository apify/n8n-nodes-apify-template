#!/usr/bin/env ts-node

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import glob from "glob";

//
// Targets
//
const TARGET_CLASS_NAME = "ApifyContentCrawler";
const TARGET_PACKAGE_NAME = "n8n-nodes-apify-content-crawler";

//
// Variables
//
const ACTOR_ID = "aYG0l9s7dbB7j3gbS";
const PACKAGE_NAME = "renamed-package";
const CLASS_NAME = "RenamedPackage";
const X_PLATFORM_HEADER_ID = "X-Platform-Header-ID";
const X_PLATFORM_APP_HEADER_ID = "X-Platform-App-Header-ID";
const DISPLAY_NAME = "Actor Display Name";

//
// 1. Create .env file
//
const tmpEnv = `.env.${process.pid}.tmp`;
const envContent = [
  `PACKAGE_NAME=${PACKAGE_NAME}`,
  `CLASS_NAME=${CLASS_NAME}`,
  `ACTOR_ID=${ACTOR_ID}`,
  `X_PLATFORM_HEADER_ID=${X_PLATFORM_HEADER_ID}`,
  `X_PLATFORM_APP_HEADER_ID=${X_PLATFORM_APP_HEADER_ID}`,
  `DISPLAY_NAME=${DISPLAY_NAME}`,
].join("\n");

fs.writeFileSync(tmpEnv, envContent);
fs.renameSync(tmpEnv, ".env");
console.log("✅ Wrote .env with PACKAGE_NAME, CLASS_NAME, ACTOR_ID, headers, and display name.");

//
// 2. Bulk edit all files (skip certain paths)
//

const ignorePatterns = [
  "**/node_modules/**",
  "**/dist/**",
  "**/docs/**",
  "**/credentials/**",
  "**/.git/**",
  "scripts/**",
];

const files = glob.sync("**/*", { nodir: true, ignore: ignorePatterns });

for (const file of files) {
  try {
    const content = fs.readFileSync(file, "utf8");
    const updated = content
      .replace(new RegExp(TARGET_CLASS_NAME, "g"), CLASS_NAME)
      .replace(new RegExp(TARGET_PACKAGE_NAME, "g"), PACKAGE_NAME);

    if (updated !== content) {
      fs.writeFileSync(file, updated, "utf8");
      console.log(`Edited: ${file}`);
    }
  } catch {
    // skip binary files or unreadable
  }
}

//
// 3. Edit Project Structure (rename folder and files)
//
const oldDir = path.join("nodes", TARGET_CLASS_NAME);
const newDir = path.join("nodes", CLASS_NAME);

if (fs.existsSync(oldDir)) {
  if (fs.existsSync(newDir)) {
    console.log(`⚠️ Target '${newDir}' already exists — skipping dir rename.`);
  } else {
    try {
      execSync(`git mv "${oldDir}" "${newDir}"`);
    } catch {
      fs.renameSync(oldDir, newDir);
    }
    console.log(`✅ Renamed folder: nodes/${TARGET_CLASS_NAME} -> nodes/${CLASS_NAME}`);
  }

  // Rename files inside
  const exts = ["methods.ts", "node.json", "node.ts", "properties.ts"];
  for (const ext of exts) {
    const oldFile = path.join(newDir, `${TARGET_CLASS_NAME}.${ext}`);
    const newFile = path.join(newDir, `${CLASS_NAME}.${ext}`);
    if (fs.existsSync(oldFile)) {
      try {
        execSync(`git mv "${oldFile}" "${newFile}"`);
      } catch {
        fs.renameSync(oldFile, newFile);
      }
      console.log(`Renamed: ${oldFile} -> ${newFile}`);
    }
  }
  console.log(`✅ Renamed files inside nodes/${CLASS_NAME}`);
} else {
  console.log(`⚠️ Warning: ${oldDir} not found (skipped).`);
}
