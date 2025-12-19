import { ApifyClient, Actor } from 'apify-client';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { refactorProject } from '../utils/refactorProject.ts';
import { type PlaceholderValues, generatePlaceholderValues, fetchActorInputSchema } from '../utils/apifyUtils.ts';
import { convertApifyToN8n } from '../utils/actorSchemaConverter.ts';
import {
	askForActorId,
	askForOperationName,
	askForOperationDescription,
	resourceNameToKey,
} from '../utils/inputPrompts.ts';
import { generateInputFunctionsFile, generatePropertyFunctionsFile } from '../utils/codeGenerators.ts';
import { createResourceFile, updateRouterFile } from '../add-actor-resource/createResourceFile.ts';
import { createOperationFile } from '../add-actor-operation/createOperationFile.ts';
import type { ApifyInputSchema } from '../utils/types.ts';
import type { INodeProperties } from 'n8n-workflow';

// Targets (old names)
const TARGET_CLASS_NAME = 'ApifyActorTemplate';
const TARGET_PACKAGE_NAME = 'n8n-nodes-apify-actor-template';

// Minimal inputs
const X_PLATFORM_HEADER_ID = 'n8n';

// Path where constants should be replaced
const NODE_FILE_PATH = `./nodes/${TARGET_CLASS_NAME}/${TARGET_CLASS_NAME}.node.ts`;

interface CollectedInputs {
	actorId: string;
	actor: Actor;
	resourceName: string;
	resourceKey: string;
	operationName: string;
	operationKey: string;
	operationDescription: string;
	inputSchema: ApifyInputSchema;
	placeholderValues: PlaceholderValues;
}

export async function setupProject() {
	console.log(chalk.cyan.bold('\n🚀 Initialize Actor App\n'));

	const nodeDir = path.join(process.cwd(), 'nodes', TARGET_CLASS_NAME);

	// Step 1: Get Actor ID
	const actorId = await askForActorId();
	if (!actorId) {
		throw new Error('❌ ACTOR_ID is required.');
	}

	// Validate Actor exists
	const client = new ApifyClient({ token: process.env.APIFY_TOKEN });
	const actor = await client.actor(actorId).get();
	if (!actor) {
		throw new Error(`❌ Actor with id ${actorId} not found.`);
	}
	console.log(chalk.green(`✔ Found Actor: ${chalk.bold(actor.title || actor.name)}`));

	// Step 2: Fetch input schema
	let inputSchema: ApifyInputSchema;
	try {
		inputSchema = await fetchActorInputSchema(actorId);
		console.log(chalk.gray(`  ${Object.keys(inputSchema.properties).length} properties found\n`));
	} catch (err) {
		console.log(chalk.red('❌ Failed to fetch Actor schema:'), err);
		throw err;
	}

	// Step 3: Set resource name from Actor
	const resourceName = actor.title || actor.name.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
	const resourceKey = resourceNameToKey(resourceName);
	console.log(chalk.green(`✔ Resource: ${chalk.bold(resourceName)} (${resourceKey})`));

	// Step 4: Get operation details
	const { name: operationName, key: operationKey } = await askForOperationName(nodeDir);
	const operationDescription = await askForOperationDescription();

	// Step 5: Generate configuration
	const placeholderValues = await generatePlaceholderValues(actor, X_PLATFORM_HEADER_ID);

	// Collect inputs
	const inputs: CollectedInputs = {
		actorId,
		actor,
		resourceName,
		resourceKey,
		operationName,
		operationKey,
		operationDescription,
		inputSchema,
		placeholderValues,
	};

	// Apply changes
	console.log(chalk.cyan('\n⚙️  Generating files...'));

	applyPlaceholders(NODE_FILE_PATH, inputs.placeholderValues);

	const n8nProperties = convertApifyToN8n(inputs.inputSchema);
	generateInputFunctionsFile(nodeDir, n8nProperties);
	generatePropertyFunctionsFile(nodeDir, n8nProperties);

	// Clean up template and create resource structure
	const templateResourcePath = path.join(nodeDir, 'resources', 'resourceOne');
	if (fs.existsSync(templateResourcePath)) {
		fs.rmSync(templateResourcePath, { recursive: true, force: true });
	}
	resetRouterToTemplate(nodeDir);

	const resourcePath = await createResourceFile(
		nodeDir,
		inputs.resourceName,
		inputs.resourceKey,
		inputs.operationName,
		inputs.operationKey,
	);

	await createOperationFile(
		resourcePath,
		inputs.operationName,
		inputs.operationKey,
		inputs.operationDescription,
		inputs.inputSchema,
		nodeDir,
	);

	await updateRouterFile(nodeDir, inputs.resourceName, inputs.resourceKey, inputs.operationKey);

	// Rename project files
	refactorProject(
		TARGET_CLASS_NAME,
		inputs.placeholderValues.CLASS_NAME,
		TARGET_PACKAGE_NAME,
		inputs.placeholderValues.PACKAGE_NAME,
	);

	// Save configuration
	const packageJsonPath = path.join(process.cwd(), 'package.json');
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
	packageJson.apify = {
		actorId: inputs.actorId,
		nodeFolderName: inputs.placeholderValues.CLASS_NAME,
	};
	fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, '\t') + '\n', 'utf-8');

	// Success
	console.log(chalk.green.bold('\n✓ Setup complete!'));
	console.log(chalk.gray(`  Package: ${placeholderValues.PACKAGE_NAME}`));
	console.log(chalk.gray(`  Operation: ${operationName}\n`));
	console.log(chalk.cyan('Next: npm run build\n'));
}

// ============================================
// Helper Functions
// ============================================

/**
 * Apply placeholders to node file
 */
function applyPlaceholders(nodeFilePath: string, values: PlaceholderValues): void {
	let nodeFile = fs.readFileSync(nodeFilePath, 'utf-8');
	for (const [key, val] of Object.entries(values)) {
		const regex = new RegExp(`\\$\\$${key}`, 'g');
		nodeFile = nodeFile.replace(regex, val);
	}
	fs.writeFileSync(nodeFilePath, nodeFile, 'utf-8');
}

/**
 * Reset router.ts to empty template
 */
function resetRouterToTemplate(nodeDir: string): void {
	const templatePath = path.join(__dirname, '../utils/templates', 'router.ts.tpl');
	const routerPath = path.join(nodeDir, 'resources', 'router.ts');

	const template = fs.readFileSync(templatePath, 'utf-8');
	fs.writeFileSync(routerPath, template, 'utf-8');
}
