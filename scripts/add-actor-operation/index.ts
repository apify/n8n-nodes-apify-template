import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';
import {
	getActorIdFromPackageJson,
	getNodeDirNameFromPackageJson,
	askForOperationName,
	askForOperationDescription,
	getResourcesList,
	askForResourceSelection,
} from '../utils.ts';
import { fetchActorInputSchema } from '../buildInputFunctions.ts';
import type { ApifyInputSchema } from '../types.ts';
import { createOperationFile, updateResourceFile } from './createOperationFile.ts';

export async function addActorOperation() {
	console.log(chalk.cyan.bold('\n🔧 Add Actor Operation\n'));

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

	// Step 2: Fetch Actor schema from Apify API
	console.log(chalk.cyan('🌐 Step 2: Fetching Actor input schema from Apify...'));

	let inputSchema: ApifyInputSchema;
	try {
		inputSchema = await fetchActorInputSchema(actorId);
		console.log(chalk.green(`✔ Fetched input schema with ${Object.keys(inputSchema.properties).length} properties\n`));
	} catch (err) {
		console.log(chalk.red('❌ Failed to fetch Actor schema:'), err);
		process.exit(1);
	}

	// Step 3: Select resource
	console.log(chalk.cyan('📁 Step 3: Selecting target resource...'));
	const resources = getResourcesList(nodeDir);

	if (resources.length === 0) {
		console.log(chalk.red('❌ No resources found.'));
		console.log(chalk.yellow('   Please run "npm run init-actor-app" first to initialize an Actor app.\n'));
		process.exit(1);
	}

	const selectedResource = await askForResourceSelection(resources);
	console.log(chalk.green(`✔ Selected resource: ${chalk.bold(selectedResource)}\n`));

	// Step 4: Ask for operation name with validation
	console.log(chalk.cyan('✏️  Step 4: Operation details...'));
	const { name: operationName, key: operationKey } = await askForOperationName(nodeDir);
	console.log(chalk.green(`✔ Operation name: ${chalk.bold(operationName)} (${operationKey})\n`));

	// Step 5: Ask for operation description
	const operationDescription = await askForOperationDescription();
	console.log(chalk.green(`✔ Description: ${chalk.bold(operationDescription)}\n`));

	// Step 6: Use all properties
	const selectedProperties = Object.keys(inputSchema.properties);
	console.log(chalk.cyan(`📋 Step 6: Using all ${selectedProperties.length} properties from Actor schema\n`));

	// Step 7: Generate operation file
	console.log(chalk.cyan('🚀 Step 7: Generating operation files...\n'));

	try {
		const resourcePath = path.join(nodeDir, 'resources', selectedResource);

		// Create the operation file
		await createOperationFile(
			resourcePath,
			operationName,
			operationKey,
			operationDescription,
			inputSchema,
			nodeDir,
		);

		// Update the resource.ts file
		await updateResourceFile(resourcePath, operationName, operationKey);

		// Success summary
		console.log(chalk.green.bold('\n✅ Operation added successfully!\n'));
		console.log(chalk.cyan('Summary:'));
		console.log(chalk.gray(`   Actor ID: ${actorId}`));
		console.log(chalk.gray(`   Operation: ${operationName} (${operationKey})`));
		console.log(chalk.gray(`   Resource: ${selectedResource}`));
		console.log(chalk.gray(`   Description: ${operationDescription}`));
		console.log(chalk.gray(`   Properties: ${selectedProperties.length} from Actor schema`));
		console.log(chalk.gray(`   File: nodes/${nodeDirName}/resources/${selectedResource}/operations/${operationKey}.ts`));
		console.log('');
	} catch (err) {
		console.log(chalk.red('\n❌ Failed to generate operation files:'), err);
		process.exit(1);
	}
}
