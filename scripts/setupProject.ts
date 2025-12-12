import { ApifyClient } from 'apify-client';
import { refactorProject } from './refactorProject.ts';
import { generateActorResources } from './actorSchemaConverter.ts';
import { setConfig } from './actorConfig.ts';
import * as readline from 'readline';

// Targets (old names)
const TARGET_CLASS_NAME = 'ApifyActorTemplate';
const TARGET_PACKAGE_NAME = 'n8n-nodes-apify-actor-template';

// Minimal inputs
const X_PLATFORM_HEADER_ID = 'n8n';

// Paths where properties should be updated
const PROPERTIES_PATHS = [
    `./nodes/${TARGET_CLASS_NAME}/${TARGET_CLASS_NAME}.properties.ts`,
];

// Paths where execute.ts should be updated
const EXECUTE_PATHS = [
    `./nodes/${TARGET_CLASS_NAME}/helpers/executeActor.ts`,
];

// Path where constants should be replaced
const NODE_FILE_PATH = `./nodes/${TARGET_CLASS_NAME}/${TARGET_CLASS_NAME}.node.ts`;

function askForActorId(): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question('👉 Please enter the ACTOR_ID: ', (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

function askForOperationCount(): Promise<number> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question('👉 How many operations? (1-10, default 1): ', (answer) => {
            rl.close();
            const trimmed = answer.trim();
            if (!trimmed) {
                resolve(1); // Default to 1
                return;
            }
            const count = parseInt(trimmed, 10);
            if (isNaN(count) || count < 1 || count > 10) {
                console.log('⚠️  Invalid number. Defaulting to 1.');
                resolve(1);
            } else {
                resolve(count);
            }
        });
    });
}

export async function setupProject() {
    // Ask user for ACTOR_ID
    const actorId = await askForActorId();

    if (!actorId) {
        throw new Error('❌ ACTOR_ID is required.');
    }

    // Ask for operation count
    const operationCount = await askForOperationCount();
    console.log(`📋 Generating ${operationCount} operation(s)...`);

    // Create ApifyClient (token optional, required for private actors)
    const client = new ApifyClient({
        token: process.env.APIFY_TOKEN,
    });

    const actor = await client.actor(actorId).get();
    if (!actor) {
        throw new Error(`❌ Actor with id ${actorId} not found.`);
    }

    // Step 1: Fetch actor info & replace placeholders
    const values = await setConfig(actor, NODE_FILE_PATH, X_PLATFORM_HEADER_ID);

    // Step 2: Conditional generation based on operationCount
    if (operationCount > 1) {
        // Use resources/operations pattern
        const { generateOperationsStructure } = await import('./generateOperations.js');
        await generateOperationsStructure(
            operationCount,
            TARGET_CLASS_NAME,
            values.CLASS_NAME,
            values.DISPLAY_NAME,
        );
    } else {
        // Use traditional single-operation pattern (existing behavior)
        await generateActorResources(
            client,
            actor,
            values.ACTOR_ID,
            PROPERTIES_PATHS,
            EXECUTE_PATHS,
            TARGET_CLASS_NAME,
        );
    }

    // Step 3: Rename files/folders and necessary code snippets
    refactorProject(
        TARGET_CLASS_NAME,
        values.CLASS_NAME,
        TARGET_PACKAGE_NAME,
        values.PACKAGE_NAME,
        operationCount > 1, // Pass flag for resources pattern
    );

    console.log('🎉 Project setup complete!');
}
