import { refactorProject } from './refactorProject.ts';
import { generateActorResources } from './actorSchemaConverter.ts';
import { setConfig } from './actorConfig.ts';

// Targets (old names)
const TARGET_CLASS_NAME = "ApifyContentCrawler";
const TARGET_PACKAGE_NAME = "n8n-nodes-apify-content-crawler";

// Variables (new names)
const ACTOR_ID = "aYG0l9s7dbB7j3gbS";
const PACKAGE_NAME = "renamed-package";
const CLASS_NAME = "RenamedPackage";
const X_PLATFORM_HEADER_ID = "n8n";
const X_PLATFORM_APP_HEADER_ID = "X-Platform-App-Header-ID";
const DISPLAY_NAME = "Actor Display Name";
const DESCRIPTION = "Actor Display Name";

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

// Path where constants should be replaced
const NODE_FILE_PATH = `./nodes/${TARGET_CLASS_NAME}/${TARGET_CLASS_NAME}.node.ts`;

export async function setupProject() {
  // Step 1: Replace placeholders
  setConfig(NODE_FILE_PATH, {
    PACKAGE_NAME,
    CLASS_NAME,
    ACTOR_ID,
    X_PLATFORM_HEADER_ID,
    X_PLATFORM_APP_HEADER_ID,
    DISPLAY_NAME,
    DESCRIPTION,
  });

  // Step 2: Generate n8n resources based on Actor input schema
  await generateActorResources(ACTOR_ID, PROPERTIES_PATHS, EXECUTE_PATHS);

  // Step 3: Rename files/folders and necessary code snippets
  refactorProject(TARGET_CLASS_NAME, CLASS_NAME, TARGET_PACKAGE_NAME, PACKAGE_NAME);
}
