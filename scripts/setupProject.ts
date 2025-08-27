import fs from 'fs';
import { refactorProject } from './refactorProject.ts';
import { createActorAppSchemaForN8n, generateActorResources } from './actorSchemaConverter.ts';
import type { INodeProperties } from 'n8n-workflow';

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

// Paths where properties should be updated
const PROPERTIES_PATHS = [
  `./nodes/${TARGET_CLASS_NAME}/resources/actors/run-actor-advanced/properties.ts`,
  `./nodes/${TARGET_CLASS_NAME}/resources/actors/run-actor-standard/properties.ts`,
];

// Paths where execute.ts should be updated
const EXECUTE_PATHS = [
  `./nodes/${TARGET_CLASS_NAME}/resources/actors/run-actor-advanced/execute.ts`,
  `./nodes/${TARGET_CLASS_NAME}/resources/actors/run-actor-standard/execute.ts`,
];

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

  // renames files/folders and necessary code snippets
  refactorProject(TARGET_CLASS_NAME, CLASS_NAME, TARGET_PACKAGE_NAME, PACKAGE_NAME);

  // Generate n8n resources based on Actor input schema and edit execute.ts and properties.ts
  await generateActorResources(ACTOR_ID, PROPERTIES_PATHS, EXECUTE_PATHS);
}
