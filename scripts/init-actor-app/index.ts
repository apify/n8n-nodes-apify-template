import { ApifyClient, Actor } from 'apify-client';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { refactorProject } from './refactorProject.ts';
import { PlaceholderValues } from './actorConfig.ts';
import { convertApifyToN8n } from './actorSchemaConverter.ts';
import {
	askForActorId,
	askForOperationName,
	askForOperationDescription,
	resourceNameToKey,
	PACKAGE_NAME_PREFIX,
	packageNameCheck,
} from '../utils.ts';
import { fetchActorInputSchema } from '../buildInputFunctions.ts';
import { createResourceFile, updateRouterFile } from '../add-actor-resource/createResourceFile.ts';
import { createOperationFile } from '../add-actor-operation/createOperationFile.ts';
import type { ApifyInputSchema } from '../types.ts';
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

	// ============================================
	// PHASE 1: Collect all user inputs
	// ============================================

	// Step 1: Ask user for ACTOR_ID
	console.log(chalk.cyan('📦 Step 1: Actor ID...'));
	const actorId = await askForActorId();

	if (!actorId) {
		throw new Error('❌ ACTOR_ID is required.');
	}

	// Create ApifyClient (token optional, required for private actors)
	const client = new ApifyClient({
		token: process.env.APIFY_TOKEN,
	});

	// Validate Actor exists
	const actor = await client.actor(actorId).get();
	if (!actor) {
		throw new Error(`❌ Actor with id ${actorId} not found.`);
	}

	console.log(chalk.green(`✔ Found Actor: ${chalk.bold(actor.title || actor.name)}\n`));

	// Step 2: Fetch Actor input schema early to validate
	console.log(chalk.cyan('🌐 Step 2: Fetching Actor input schema from Apify...'));
	let inputSchema: ApifyInputSchema;
	try {
		inputSchema = await fetchActorInputSchema(actorId);
		console.log(chalk.green(`✔ Fetched input schema with ${Object.keys(inputSchema.properties).length} properties\n`));
	} catch (err) {
		console.log(chalk.red('❌ Failed to fetch Actor schema:'), err);
		throw err;
	}

	// Step 3: Use actor's display name as resource name (automatically)
	console.log(chalk.cyan('✏️  Step 3: Setting resource name from Actor...'));
	const resourceName = actor.title || actor.name.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
	const resourceKey = resourceNameToKey(resourceName);
	console.log(chalk.green(`✔ Resource name: ${chalk.bold(resourceName)} (${resourceKey})\n`));

	// Step 4: Ask for initial operation details
	console.log(chalk.cyan('✏️  Step 4: Initial operation details...'));
	console.log(chalk.gray('   Each resource requires at least one operation.\n'));
	const { name: operationName, key: operationKey } = await askForOperationName(nodeDir);
	console.log(chalk.green(`✔ Operation name: ${chalk.bold(operationName)} (${operationKey})\n`));

	// Step 5: Ask for operation description
	const operationDescription = await askForOperationDescription();
	console.log(chalk.green(`✔ Description: ${chalk.bold(operationDescription)}\n`));

	// Step 6: Generate placeholder values (includes package name check)
	console.log(chalk.cyan('⚙️  Step 6: Generating configuration values...'));
	const placeholderValues = await generatePlaceholderValues(actor);
	console.log(chalk.green('✔ Configuration values ready\n'));

	// ============================================
	// Summary and Confirmation
	// ============================================
	console.log(chalk.cyan.bold('\n📋 Summary of changes to be made:\n'));
	console.log(chalk.gray(`   Actor ID: ${actorId}`));
	console.log(chalk.gray(`   Package name: ${placeholderValues.PACKAGE_NAME}`));
	console.log(chalk.gray(`   Class name: ${placeholderValues.CLASS_NAME}`));
	console.log(chalk.gray(`   Resource: ${resourceName} (${resourceKey})`));
	console.log(chalk.gray(`   Operation: ${operationName} (${operationKey})`));
	console.log(chalk.gray(`   Properties: ${Object.keys(inputSchema.properties).length} from Actor schema`));
	console.log('');

	// Collect all inputs into a single object
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

	// ============================================
	// PHASE 2: Apply all changes
	// ============================================

	console.log(chalk.cyan.bold('🔧 Applying changes...\n'));

	// Step 7: Replace placeholders in node file
	console.log(chalk.cyan('   Step 7: Configuring node file...'));
	applyPlaceholders(NODE_FILE_PATH, inputs.placeholderValues);
	console.log(chalk.green('   ✔ Node file configured'));

	// Step 8: Generate inputFunctions.ts and propertyFunctions.ts
	console.log(chalk.cyan('   Step 8: Generating helper functions...'));
	const n8nProperties = convertApifyToN8n(inputs.inputSchema);
	generateInputFunctionsFile(nodeDir, n8nProperties);
	generatePropertyFunctionsFile(nodeDir, n8nProperties);
	console.log(chalk.green('   ✔ Helper functions generated'));

	// Step 9: Clean up existing resource_one and reset router, then create new resource
	console.log(chalk.cyan('   Step 9: Setting up resource structure...'));

	// Remove the template resource_one folder
	const templateResourcePath = path.join(nodeDir, 'resources', 'resource_one');
	if (fs.existsSync(templateResourcePath)) {
		fs.rmSync(templateResourcePath, { recursive: true, force: true });
	}

	// Reset router.ts to empty template
	resetRouterToTemplate(nodeDir);

	// Create the resource folder and resource.ts file
	const resourcePath = await createResourceFile(
		nodeDir,
		inputs.resourceName,
		inputs.resourceKey,
		inputs.operationName,
		inputs.operationKey,
	);

	// Create the operation file within the new resource
	await createOperationFile(
		resourcePath,
		inputs.operationName,
		inputs.operationKey,
		inputs.operationDescription,
		inputs.inputSchema,
		nodeDir,
	);

	// Update the router.ts file to include the new resource
	await updateRouterFile(nodeDir, inputs.resourceName, inputs.resourceKey, inputs.operationKey);

	console.log(chalk.green('   ✔ Resource and operation files created'));

	// Step 10: Rename files/folders and necessary code snippets
	console.log(chalk.cyan('   Step 10: Renaming project files...'));
	refactorProject(
		TARGET_CLASS_NAME,
		inputs.placeholderValues.CLASS_NAME,
		TARGET_PACKAGE_NAME,
		inputs.placeholderValues.PACKAGE_NAME,
	);
	console.log(chalk.green('   ✔ Project files renamed'));

	// Step 11: Save Actor ID to package.json
	console.log(chalk.cyan('   Step 11: Saving configuration to package.json...'));
	const packageJsonPath = path.join(process.cwd(), 'package.json');
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
	packageJson.apify = {
		actorId: inputs.actorId,
	};
	fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, '\t') + '\n', 'utf-8');
	console.log(chalk.green('   ✔ Actor ID saved to package.json'));

	// ============================================
	// Success summary
	// ============================================
	console.log(chalk.green.bold('\n🎉 Project setup complete!\n'));
	console.log(chalk.cyan('Files created:'));
	console.log(chalk.gray(`   - nodes/${inputs.placeholderValues.CLASS_NAME}/helpers/inputFunctions.ts`));
	console.log(chalk.gray(`   - nodes/${inputs.placeholderValues.CLASS_NAME}/helpers/propertyFunctions.ts`));
	console.log(chalk.gray(`   - nodes/${inputs.placeholderValues.CLASS_NAME}/resources/${inputs.resourceKey}/resource.ts`));
	console.log(chalk.gray(`   - nodes/${inputs.placeholderValues.CLASS_NAME}/resources/${inputs.resourceKey}/operations/${inputs.operationKey}.ts`));
	console.log('');
	console.log(chalk.cyan('Next steps:'));
	console.log(chalk.gray('   1. Run "npm run build" to build the project'));
	console.log(chalk.gray('   2. Run "npm run add-actor-resource" to add more resources'));
	console.log(chalk.gray('   3. Run "npm run add-actor-operation" to add more operations'));
	console.log('');
}

// ============================================
// Helper Functions
// ============================================

/**
 * Generate placeholder values from actor (without modifying files)
 */
async function generatePlaceholderValues(actor: Actor): Promise<PlaceholderValues> {
	const rawName = actor.name;
	const rawNameProcessed = rawName
		.split('-')
		.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');

	const className = 'Apify' + rawName
		.split('-')
		.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
		.join('');
	const displayName = 'Apify ' + `${actor.title ? actor.title : rawNameProcessed}`;

	const values: PlaceholderValues = {
		PACKAGE_NAME: `${PACKAGE_NAME_PREFIX}-${rawName}`,
		CLASS_NAME: className,
		ACTOR_ID: actor.id,
		X_PLATFORM_HEADER_ID: X_PLATFORM_HEADER_ID,
		X_PLATFORM_APP_HEADER_ID: `${rawName}-app`,
		DISPLAY_NAME: displayName,
		DESCRIPTION: actor.description || '',
		RESOURCE_NAME: actor.title || displayName,
	};

	// Check for package name availability on npm registry
	values.PACKAGE_NAME = await packageNameCheck(values.PACKAGE_NAME);

	return values;
}

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
	const templatePath = path.join(__dirname, '../fileTemplates', 'router.ts.tpl');
	const routerPath = path.join(nodeDir, 'resources', 'router.ts');

	const template = fs.readFileSync(templatePath, 'utf-8');
	fs.writeFileSync(routerPath, template, 'utf-8');
}

/**
 * Generate inputFunctions.ts file
 */
function generateInputFunctionsFile(nodeDir: string, properties: INodeProperties[]): void {
	const functionsCode = generateAllGetterFunctions(properties);

	const templatePath = path.join(__dirname, '../fileTemplates', 'inputFunctions.ts.tpl');
	let template = fs.readFileSync(templatePath, 'utf-8');
	template = template.replace('{{FUNCTIONS}}', functionsCode);

	const outputPath = path.join(nodeDir, 'helpers', 'inputFunctions.ts');
	fs.mkdirSync(path.dirname(outputPath), { recursive: true });
	fs.writeFileSync(outputPath, template, 'utf-8');
}

/**
 * Generate propertyFunctions.ts file
 */
function generatePropertyFunctionsFile(nodeDir: string, properties: INodeProperties[]): void {
	const functionsCode = generateAllPropertyFunctions(properties);

	const templatePath = path.join(__dirname, '../fileTemplates', 'propertyFunctions.ts.tpl');
	let template = fs.readFileSync(templatePath, 'utf-8');
	template = template.replace('{{FUNCTIONS}}', functionsCode);

	const outputPath = path.join(nodeDir, 'helpers', 'propertyFunctions.ts');
	fs.mkdirSync(path.dirname(outputPath), { recursive: true });
	fs.writeFileSync(outputPath, template, 'utf-8');
}

// ============================================
// Code Generation Functions
// ============================================

function capitalizeFirst(str: string): string {
	if (!str) return '';
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateAllGetterFunctions(properties: INodeProperties[]): string {
	const functions: string[] = [];

	for (const prop of properties) {
		if (prop.type === 'fixedCollection') {
			functions.push(generateFixedCollectionGetter(prop));
		} else {
			functions.push(generateRegularGetter(prop));
		}
	}

	return functions.join('\n\n');
}

function generateRegularGetter(prop: INodeProperties): string {
	const paramName = prop.name;
	const functionName = `get${capitalizeFirst(paramName)}`;
	const tsType = getTypeScriptType(prop.type as string);

	const jsdoc = `/**\n * Get ${paramName} parameter\n */`;

	const code = [
		jsdoc,
		`export function ${functionName}(this: IExecuteFunctions, i: number): ${tsType} {`,
		`\tconst ${paramName} = this.getNodeParameter('${paramName}', i) as ${tsType};`,
		`\treturn ${paramName};`,
		`}`,
	].join('\n');

	return code;
}

function generateFixedCollectionGetter(prop: INodeProperties): string {
	const paramName = prop.name;
	const functionName = `get${capitalizeFirst(paramName)}`;

	const options = prop.options as any[];

	if (!options || options.length === 0) {
		return generateRegularGetter({ ...prop, type: 'json' });
	}

	const collectionName = options[0].name;
	const fields = options[0].values || [];

	const typeFields = fields.map((field: any) => {
		const fieldType = mapFieldType(field.type);
		return `${field.name}: ${fieldType}`;
	});

	const entryType = typeFields.length > 0 ? `{ ${typeFields.join('; ')} }` : 'any';
	const returnType = `{\n\t${collectionName}?: ${entryType}[];\n}`;

	const jsdoc = `/**\n * Get ${paramName} parameter (list)\n */`;

	const code = [
		jsdoc,
		`export function ${functionName}(this: IExecuteFunctions, i: number): ${returnType} {`,
		`\tconst ${paramName} = this.getNodeParameter('${paramName}', i, {}) as ${returnType};`,
		`\treturn ${paramName};`,
		`}`,
	].join('\n');

	return code;
}

function mapFieldType(n8nType: string): string {
	if (n8nType === 'string') return 'string';
	if (n8nType === 'number') return 'number';
	if (n8nType === 'boolean') return 'boolean';
	return 'any';
}

function getTypeScriptType(n8nType: string): string {
	const typeMap: Record<string, string> = {
		'string': 'string',
		'number': 'number',
		'boolean': 'boolean',
		'dateTime': 'string',
		'json': 'object | string',
		'options': 'string',
		'multiOptions': 'string[]',
		'collection': 'object',
	};

	return typeMap[n8nType] || 'any';
}

function generateAllPropertyFunctions(properties: INodeProperties[]): string {
	const functions: string[] = [];

	for (const prop of properties) {
		functions.push(generatePropertyFunction(prop));
	}

	return functions.join('\n\n');
}

function generatePropertyFunction(prop: INodeProperties): string {
	const functionName = `get${capitalizeFirst(prop.name)}Property`;

	const { displayOptions, ...propWithoutDisplayOptions } = prop;

	// Serialize property without displayOptions, with proper indentation
	const propJson = JSON.stringify(propWithoutDisplayOptions, null, '\t');

	// Remove the outer braces and add proper indentation
	const lines = propJson.split('\n');
	// Remove first line (opening brace) and last line (closing brace)
	const contentLines = lines.slice(1, -1);
	// Add extra tab for indentation inside return statement
	const indentedContent = contentLines.map(line => '\t\t' + line).join('\n');

	const jsdoc = `/**\n * Property definition for ${prop.name}\n */`;

	const code = [
		jsdoc,
		`export function ${functionName}(resourceName: string, operationName: string): INodeProperties {`,
		`\treturn {`,
		indentedContent + ',',
		`\t\tdisplayOptions: {`,
		`\t\t\tshow: {`,
		`\t\t\t\tresource: [resourceName],`,
		`\t\t\t\toperation: [operationName],`,
		`\t\t\t},`,
		`\t\t},`,
		`\t};`,
		`}`,
	].join('\n');

	return code;
}
