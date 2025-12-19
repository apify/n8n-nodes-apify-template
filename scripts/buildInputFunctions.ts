import { ApifyClient } from 'apify-client';
import chalk from 'chalk';
import type { INodeProperties } from 'n8n-workflow';
import type { ApifyInputSchema } from './types.ts';
import { convertApifyToN8n } from './init-actor-app/actorSchemaConverter.ts';
import { getNodeDirNameFromPackageJson } from './utils.ts';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Fetch Actor input schema from Apify API
 * This is a reusable utility function to avoid duplicating fetch logic
 */
export async function fetchActorInputSchema(actorId: string): Promise<ApifyInputSchema> {
	const client = new ApifyClient();

	// Fetch Actor
	const actor = await client.actor(actorId).get();
	if (!actor) {
		throw new Error(`Actor with ID ${actorId} not found`);
	}

	// Get default build
	const defaultBuild = actor.defaultRunOptions?.build || 'latest';
	const buildId = actor.taggedBuilds?.[defaultBuild]?.buildId;
	if (!buildId) {
		throw new Error(`Build not found for Actor ${actorId}`);
	}

	// Fetch build
	const build = await client.build(buildId).get();
	if (!build?.actorDefinition?.input) {
		throw new Error('No input schema found in build');
	}

	return build.actorDefinition.input as ApifyInputSchema;
}

/**
 * Generate TypeScript getter functions for n8n node parameters from an Actor ID
 */
export async function generateInputFunctions(actorId: string): Promise<void> {
	console.log(chalk.cyan('🧪 Input Functions Generator'));
	console.log(`${chalk.blue('Actor ID:')} ${actorId}\n`);

	// Fetch Actor input schema using shared utility
	const inputSchema = await fetchActorInputSchema(actorId);
	const n8nProperties = convertApifyToN8n(inputSchema);

	console.log(`${chalk.green('✔')} Found ${n8nProperties.length} parameters`);

	// Generate functions code
	const functionsCode = generateAllGetterFunctions(n8nProperties);

	// Read template and replace placeholder
	const templatePath = path.join(__dirname, 'templates', 'inputFunctions.ts.tpl');
	let template = fs.readFileSync(templatePath, 'utf-8');
	template = template.replace('{{FUNCTIONS}}', functionsCode);

	// Get node directory from package.json
	const nodeDirName = getNodeDirNameFromPackageJson();

	if (!nodeDirName) {
		console.log(chalk.red('❌ Project not initialized.'));
		console.log(chalk.yellow('   Please run "npm run init-actor-app" first to initialize an Actor app.\n'));
		throw new Error('Project not initialized');
	}

	// Write to the node's helpers directory
	const helpersDir = path.join(process.cwd(), 'nodes', nodeDirName, 'helpers');
	fs.mkdirSync(helpersDir, { recursive: true });
	const outputPath = path.join(helpersDir, 'inputFunctions.ts');

	// Write output
	fs.writeFileSync(outputPath, template, 'utf-8');

	console.log(chalk.green(`✅ Generated: ${outputPath}\n`));
}

/**
 * Generate all getter functions
 */
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

/**
 * Generate getter for regular properties (string, number, boolean, etc.)
 */
function generateRegularGetter(prop: INodeProperties): string {
	const paramName = prop.name;
	const functionName = `get${capitalizeFirst(paramName)}`;
	const tsType = getTypeScriptType(prop.type);

	// For JSON types, use JSON template
	if (prop.type === 'json') {
		const templatePath = path.join(__dirname, 'templates', 'functionTemplates', 'jsonGetter.ts.tpl');
		let template = fs.readFileSync(templatePath, 'utf-8');
		template = template.replace(/{{PARAM_NAME}}/g, paramName);
		template = template.replace(/{{FUNCTION_NAME}}/g, functionName);
		return template;
	}

	// For regular types, use regular template
	const templatePath = path.join(__dirname, 'templates', 'functionTemplates', 'regularGetter.ts.tpl');
	let template = fs.readFileSync(templatePath, 'utf-8');
	template = template.replace(/{{PARAM_NAME}}/g, paramName);
	template = template.replace(/{{FUNCTION_NAME}}/g, functionName);
	template = template.replace(/{{TS_TYPE}}/g, tsType);
	return template;
}

/**
 * Generate getter for fixedCollection (list entries)
 *
 * n8n wraps lists in an object: { items?: { url: string }[] }
 * This function extracts the array directly for Apify API compatibility
 *
 * Handles three types:
 * 1. stringList: { values: [{ value: "str" }] } → ["str"]
 * 2. requestListSources: { items: [{ url: "..." }] } → [{ url: "..." }]
 * 3. keyValue/objectList: { pairs: [{ key: "k", value: "v" }] } → [{ key: "k", value: "v" }]
 */
function generateFixedCollectionGetter(prop: INodeProperties): string {
	const paramName = prop.name;
	const functionName = `get${capitalizeFirst(paramName)}`;

	const options = prop.options as any[];

	// Fallback if no options
	if (!options || options.length === 0) {
		return generateRegularGetter({ ...prop, type: 'json' });
	}

	// Get collection details
	const collectionName = options[0].name; // e.g., 'items', 'values', 'pairs'
	const fields = options[0].values || [];

	// Check if this is a stringList (single field named 'value')
	const isStringList = fields.length === 1 && fields[0].name === 'value' && fields[0].type === 'string';

	if (isStringList) {
		// Use stringList template - extracts string values into simple array
		const templatePath = path.join(__dirname, 'templates', 'functionTemplates', 'stringListGetter.ts.tpl');
		let template = fs.readFileSync(templatePath, 'utf-8');
		template = template.replace(/{{PARAM_NAME}}/g, paramName);
		template = template.replace(/{{FUNCTION_NAME}}/g, functionName);
		template = template.replace(/{{COLLECTION_NAME}}/g, collectionName);
		template = template.replace(/{{FIELD_NAME}}/g, 'value');
		return template;
	}

	// For requestListSources, keyValue, and other object lists
	// Build type for each field in the collection entry
	const typeFields = fields.map((field: any) => {
		const fieldType = mapFieldType(field.type);
		return `${field.name}: ${fieldType}`;
	});

	const entryType = typeFields.length > 0 ? `{ ${typeFields.join('; ')} }` : 'any';
	const arrayReturnType = `${entryType}[]`;

	// Use fixedCollection template - returns array of objects
	const templatePath = path.join(__dirname, 'templates', 'functionTemplates', 'fixedCollectionGetter.ts.tpl');
	let template = fs.readFileSync(templatePath, 'utf-8');
	template = template.replace(/{{PARAM_NAME}}/g, paramName);
	template = template.replace(/{{FUNCTION_NAME}}/g, functionName);
	template = template.replace(/{{COLLECTION_NAME}}/g, collectionName);
	template = template.replace(/{{ENTRY_TYPE}}/g, entryType);
	template = template.replace(/{{ARRAY_RETURN_TYPE}}/g, arrayReturnType);
	return template;
}

/**
 * Map n8n field type to TypeScript type
 */
function mapFieldType(n8nType: string): string {
	if (n8nType === 'string') return 'string';
	if (n8nType === 'number') return 'number';
	if (n8nType === 'boolean') return 'boolean';
	return 'any';
}

/**
 * Get TypeScript type from n8n property type
 */
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

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
	if (!str) return '';
	return str.charAt(0).toUpperCase() + str.slice(1);
}
