import { ApifyClient } from 'apify-client';
import { refactorProject } from './refactorProject.ts';
import { generateActorResources } from './actorSchemaConverter.ts';
import { setConfig } from './actorConfig.ts';

// Targets (old names)
const TARGET_CLASS_NAME = "ApifyContentCrawler";
const TARGET_PACKAGE_NAME = "n8n-nodes-apify-content-crawler";

// Minimal inputs
const ACTOR_ID = "aYG0l9s7dbB7j3gbS";
const X_PLATFORM_HEADER_ID = "n8n";

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
  // Create ApifyClient (token optional, required for private actors)
  const client = new ApifyClient();

  const actor = await client.actor(ACTOR_ID).get();
  if (!actor) {
    throw new Error(`❌ Actor with id ${ACTOR_ID} not found.`);
  }

  // Step 1: Fetch actor info & replace placeholders
  const values = await setConfig(client, NODE_FILE_PATH, ACTOR_ID, X_PLATFORM_HEADER_ID);

  // Step 2: Generate n8n resources based on Actor input schema
  // await generateActorResources(client, actor, values.ACTOR_ID, PROPERTIES_PATHS, EXECUTE_PATHS);

  // // Step 3: Rename files/folders and necessary code snippets
  // refactorProject(TARGET_CLASS_NAME, values.CLASS_NAME, TARGET_PACKAGE_NAME, values.PACKAGE_NAME);
}
