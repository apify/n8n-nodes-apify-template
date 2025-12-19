import { ApifyClient } from 'apify-client';
import chalk from 'chalk';
import type { INodeProperties } from 'n8n-workflow';
import type { ApifyInputSchema } from './types.ts';
import { convertApifyToN8n } from './init-actor-app/actorSchemaConverter.ts';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Fetch Actor input schema from Apify API
 */
async function fetchActorInputSchema(actorId: string): Promise<ApifyInputSchema> {
	const client = new ApifyClient();

	const actor = await client.actor(actorId).get();
	if (!actor) {
		throw new Error(`Actor with ID ${actorId} not found`);
	}

	const defaultBuild = actor.defaultRunOptions?.build || 'latest';
	const buildId = actor.taggedBuilds?.[defaultBuild]?.buildId;
	if (!buildId) {
		throw new Error(`Build not found for Actor ${actorId}`);
	}

	const build = await client.build(buildId).get();
	if (!build?.actorDefinition?.input) {
		throw new Error('No input schema found in build');
	}

	return build.actorDefinition.input as ApifyInputSchema;
}

/**
 * Generate TypeScript property functions for n8n node properties from an Actor ID
 */
export async function generatePropertyFunctions(actorId: string): Promise<void> {
	console.log(chalk.cyan('🧪 Property Functions Generator'));
	console.log(`${chalk.blue('Actor ID:')} ${actorId}\n`);

	// Fetch Actor input schema
	const inputSchema = await fetchActorInputSchema(actorId);
	const n8nProperties = convertApifyToN8n(inputSchema);

	console.log(`${chalk.green('✔')} Found ${n8nProperties.length} properties`);

	// Generate property functions code
	const functionsCode = generateAllPropertyFunctions(n8nProperties);

	// Read template and replace placeholder
	const templatePath = path.join(__dirname, 'templates', 'propertyFunctions.ts.tpl');
	let template = fs.readFileSync(templatePath, 'utf-8');
	template = template.replace('{{FUNCTIONS}}', functionsCode);

	// Find node directory
	const nodesDir = path.join(process.cwd(), 'nodes');
	const nodeDirs = fs.readdirSync(nodesDir).filter((dir) => {
		const fullPath = path.join(nodesDir, dir);
		return fs.statSync(fullPath).isDirectory();
	});

	const targetNodeDir = nodeDirs.find(dir => dir !== 'ApifyActorTemplate') || nodeDirs[0];

	let outputPath: string;
	if (targetNodeDir) {
		const helpersDir = path.join(nodesDir, targetNodeDir, 'helpers');
		fs.mkdirSync(helpersDir, { recursive: true });
		outputPath = path.join(helpersDir, 'propertyFunctions.ts');
	} else {
		outputPath = path.join(process.cwd(), 'propertyFunctions.ts');
	}

	// Write output
	fs.writeFileSync(outputPath, template, 'utf-8');

	console.log(chalk.green(`✅ Generated: ${outputPath}\n`));
}

/**
 * Generate all property functions
 */
function generateAllPropertyFunctions(properties: INodeProperties[]): string {
	const functions: string[] = [];

	for (const prop of properties) {
		functions.push(generatePropertyFunction(prop));
	}

	return functions.join('\n\n');
}

/**
 * Generate a single property function
 */
function generatePropertyFunction(prop: INodeProperties): string {
	const functionName = `get${capitalizeFirst(prop.name)}Property`;

	// Remove any existing displayOptions from the property
	const { displayOptions, ...propWithoutDisplayOptions } = prop;

	// Serialize property without displayOptions, with proper indentation
	const propJson = JSON.stringify(propWithoutDisplayOptions, null, '\t');

	// Remove the outer braces and add proper indentation
	const lines = propJson.split('\n');
	// Remove first line (opening brace) and last line (closing brace)
	const contentLines = lines.slice(1, -1);
	// Add extra tab for indentation inside return statement
	const indentedContent = contentLines.map(line => '\t\t' + line).join('\n');

	// Build JSDoc comment
	const jsdoc = `/**\n * Property definition for ${prop.name}\n */`;

	// Build function code
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

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
	if (!str) return '';
	return str.charAt(0).toUpperCase() + str.slice(1);
}
