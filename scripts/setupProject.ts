import { ApifyClient } from 'apify-client';
import { refactorProject } from './refactorProject.ts';
import { generateActorResources } from './actorSchemaConverter.ts';
import { setConfig } from './actorConfig.ts';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

// Targets (old names)
const TARGET_CLASS_NAME = 'ApifyActorTemplate';
const TARGET_PACKAGE_NAME = 'n8n-nodes-apify-actor-template';

// Minimal inputs
const X_PLATFORM_HEADER_ID = 'n8n';

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
    // Ask user for ACTOR_ID
    const rl = readline.createInterface({ input, output });
    const ACTOR_ID = await rl.question('👉 Please enter the ACTOR_ID: ');
    rl.close();

    // Create ApifyClient (token optional, required for private actors)
    const client = new ApifyClient({
        token: process.env.APIFY_TOKEN,
    });

    const actor = await client.actor(ACTOR_ID).get();
    if (!actor) {
        throw new Error(`❌ Actor with id ${ACTOR_ID} not found.`);
    }

    // Step 1: Fetch actor info & replace placeholders
    const values = await setConfig(actor, NODE_FILE_PATH, X_PLATFORM_HEADER_ID);

    // Step 2: Generate n8n resources based on Actor input schema
    await generateActorResources(client, actor, values.ACTOR_ID, PROPERTIES_PATHS, EXECUTE_PATHS);

    // Step 3: Rename files/folders and necessary code snippets
    refactorProject(TARGET_CLASS_NAME, values.CLASS_NAME, TARGET_PACKAGE_NAME, values.PACKAGE_NAME);

    console.log('🎉 Project setup complete!');
}

// Run immediately if called directly
setupProject().catch((err) => {
    console.error(err);
    process.exit(1);
});
