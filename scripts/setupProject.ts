import fs from 'fs';
import { refactorProject } from './refactorProject.ts';

// Targets (old names)
const TARGET_CLASS_NAME = "ApifyContentCrawler";
const TARGET_PACKAGE_NAME = "n8n-nodes-apify-content-crawler";

// Variables (new names)
const ACTOR_ID = "aYG0l9s7dbB7j3gbS";
const PACKAGE_NAME = "renamed-package";
const CLASS_NAME = "RenamedPackage";
const X_PLATFORM_HEADER_ID = "X-Platform-Header-ID";
const X_PLATFORM_APP_HEADER_ID = "X-Platform-App-Header-ID";
const DISPLAY_NAME = "Actor Display Name";

export async function setupProject() {
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

  refactorProject(TARGET_CLASS_NAME, CLASS_NAME, TARGET_PACKAGE_NAME, PACKAGE_NAME);
}
