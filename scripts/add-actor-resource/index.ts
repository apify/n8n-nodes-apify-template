import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';
import {
	askForResourceName,
	askForOperationName,
	askForOperationDescription,
} from '../utils/inputPrompts.ts';
import { getActorIdFromPackageJson, getNodeDirNameFromPackageJson } from '../utils/packageUtils.ts';
import { fetchActorInputSchema } from '../utils/apifyUtils.ts';
import type { ApifyInputSchema } from '../utils/types.ts';
import { createResourceFile, updateRouterFile } from './createResourceFile.ts';
import { createOperationFile } from '../add-actor-operation/createOperationFile.ts';

export async function addActorResource() {
	console.log(chalk.cyan.bold('\n🔧 Add Actor Resource\n'));

	// Step 1: Get Actor ID and node folder name from package.json
	console.log(chalk.cyan('📦 Step 1: Reading configuration from package.json...'));
	const actorId = getActorIdFromPackageJson();
	const nodeDirName = getNodeDirNameFromPackageJson();

	if (!actorId || !nodeDirName) {
		console.log(chalk.red('❌ Project not initialized.'));
		console.log(chalk.yellow('   Please run "npm run init-actor-app" first to initialize an Actor app.\n'));
		process.exit(1);
	}

	const nodeDir = path.join(process.cwd(), 'nodes', nodeDirName);

	// Verify the node directory exists
	if (!fs.existsSync(nodeDir)) {
		console.log(chalk.red(`❌ Node directory not found: nodes/${nodeDirName}/`));
		console.log(chalk.yellow('   Please run "npm run init-actor-app" first to initialize an Actor app.\n'));
		process.exit(1);
	}

	console.log(chalk.green(`✔ Found Actor ID: ${chalk.bold(actorId)}\n`));

	// Step 2: Ask for resource name with validation
	console.log(chalk.cyan('✏️  Step 2: Resource details...'));
	const { name: resourceName, key: resourceKey } = await askForResourceName(nodeDir);
	console.log(chalk.green(`✔ Resource name: ${chalk.bold(resourceName)} (${resourceKey})\n`));

	// Step 3: Ask for initial operation name with validation
	console.log(chalk.cyan('✏️  Step 3: Initial operation details...'));
	console.log(chalk.gray('   Each resource requires at least one operation.\n'));
	const { name: operationName, key: operationKey } = await askForOperationName(nodeDir);
	console.log(chalk.green(`✔ Operation name: ${chalk.bold(operationName)} (${operationKey})\n`));

	// Step 4: Ask for operation description
	const operationDescription = await askForOperationDescription();
	console.log(chalk.green(`✔ Description: ${chalk.bold(operationDescription)}\n`));

	// Step 5: Fetch Actor schema from Apify API
	console.log(chalk.cyan('🌐 Step 5: Fetching Actor input schema from Apify...'));

	let inputSchema: ApifyInputSchema;
	try {
		inputSchema = await fetchActorInputSchema(actorId);
		console.log(chalk.green(`✔ Fetched input schema with ${Object.keys(inputSchema.properties).length} properties\n`));
	} catch (err) {
		console.log(chalk.red('❌ Failed to fetch Actor schema:'), err);
		process.exit(1);
	}

	// Step 6: Generate resource and operation files
	console.log(chalk.cyan('🚀 Step 6: Generating resource and operation files...\n'));

	try {
		// Create the resource folder and resource.ts file
		const resourcePath = await createResourceFile(
			nodeDir,
			resourceName,
			resourceKey,
			operationName,
			operationKey,
		);

		// Create the operation file within the new resource
		await createOperationFile(
			resourcePath,
			operationName,
			operationKey,
			operationDescription,
			inputSchema,
			nodeDir,
		);

		// Update the router.ts file to include the new resource
		await updateRouterFile(nodeDir, resourceName, resourceKey, operationKey);

		// Success summary
		console.log(chalk.green.bold('\n✅ Resource added successfully!\n'));
		console.log(chalk.cyan('Summary:'));
		console.log(chalk.gray(`   Actor ID: ${actorId}`));
		console.log(chalk.gray(`   Resource: ${resourceName} (${resourceKey})`));
		console.log(chalk.gray(`   Operation: ${operationName} (${operationKey})`));
		console.log(chalk.gray(`   Description: ${operationDescription}`));
		console.log(chalk.gray(`   Properties: ${Object.keys(inputSchema.properties).length} from Actor schema`));
		console.log(chalk.gray(`   Files created:`));
		console.log(chalk.gray(`     - nodes/${nodeDirName}/resources/${resourceKey}/resource.ts`));
		console.log(chalk.gray(`     - nodes/${nodeDirName}/resources/${resourceKey}/operations/${operationKey}.ts`));
		console.log(chalk.gray(`   Files updated:`));
		console.log(chalk.gray(`     - nodes/${nodeDirName}/resources/router.ts`));
		console.log('');
	} catch (err) {
		console.log(chalk.red('\n❌ Failed to generate resource files:'), err);
		process.exit(1);
	}
}
