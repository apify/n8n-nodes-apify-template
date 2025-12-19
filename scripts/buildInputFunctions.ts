import { ApifyClient } from 'apify-client';
import chalk from 'chalk';
import type { INodeProperties } from 'n8n-workflow';
import type { ApifyInputSchema } from './types.ts';
import { convertApifyToN8n } from './init-actor-app/actorSchemaConverter.ts';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generate TypeScript getter functions for n8n node parameters from an Actor ID
 */
export async function generateInputFunctions(actorId: string): Promise<void> {
	console.log(chalk.cyan('🧪 Input Functions Generator'));
	console.log(`${chalk.blue('Actor ID:')} ${actorId}\n`);

	const client = new ApifyClient();

	// Fetch Actor and build
	const actor = await client.actor(actorId).get();
	if (!actor) throw new Error(`Actor with ID ${actorId} not found`);

	const defaultBuild = actor.defaultRunOptions?.build || 'latest';
	const buildId = actor.taggedBuilds?.[defaultBuild]?.buildId;
	if (!buildId) throw new Error(`Build not found`);

	const build = await client.build(buildId).get();
	if (!build?.actorDefinition?.input) throw new Error('No input schema found');

	const inputSchema = build.actorDefinition.input as ApifyInputSchema;
	const n8nProperties = convertApifyToN8n(inputSchema);

	console.log(`${chalk.green('✔')} Found ${n8nProperties.length} parameters`);

	// Generate functions code
	const functionsCode = generateAllGetterFunctions(n8nProperties);

	// Read template and replace placeholder
	const templatePath = path.join(__dirname, 'fileTemplates', 'inputFunctions.ts.tpl');
	let template = fs.readFileSync(templatePath, 'utf-8');
	template = template.replace('{{FUNCTIONS}}', functionsCode);

	// Find node directory (any folder in nodes/ that's not ApifyActorTemplate)
	const nodesDir = path.join(process.cwd(), 'nodes');
	const nodeDirs = fs.readdirSync(nodesDir).filter((dir) => {
		const fullPath = path.join(nodesDir, dir);
		return fs.statSync(fullPath).isDirectory();
	});

	// Use the first non-template node directory, or fallback to root
	const targetNodeDir = nodeDirs.find(dir => dir !== 'ApifyActorTemplate') || nodeDirs[0];

	let outputPath: string;
	if (targetNodeDir) {
		const helpersDir = path.join(nodesDir, targetNodeDir, 'helpers');
		fs.mkdirSync(helpersDir, { recursive: true });
		outputPath = path.join(helpersDir, 'inputFunctions.ts');
	} else {
		// Fallback to root if no node directory found
		outputPath = path.join(process.cwd(), 'inputFunctions.ts');
	}

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

	// Build simple JSDoc comment (no description to avoid breaking JSDoc with special chars)
	const jsdoc = `/**\n * Get ${paramName} parameter\n */`;

	// Build function code
	const code = [
		jsdoc,
		`export function ${functionName}(this: IExecuteFunctions, i: number): ${tsType} {`,
		`\tconst ${paramName} = this.getNodeParameter('${paramName}', i) as ${tsType};`,
		`\treturn ${paramName};`,
		`}`,
	].join('\n');

	return code;
}

/**
 * Generate getter for fixedCollection (list entries)
 *
 * n8n wraps lists in an object: { items?: { url: string }[] }
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
	const collectionName = options[0].name; // e.g., 'items', 'pairs'
	const fields = options[0].values || [];

	// Build type for each field in the collection entry
	const typeFields = fields.map((field: any) => {
		const fieldType = mapFieldType(field.type);
		return `${field.name}: ${fieldType}`;
	});

	const entryType = typeFields.length > 0 ? `{ ${typeFields.join('; ')} }` : 'any';
	const returnType = `{\n\t${collectionName}?: ${entryType}[];\n}`;

	// Build simple JSDoc comment
	const jsdoc = `/**\n * Get ${paramName} parameter (list)\n */`;

	// Build function code
	const code = [
		jsdoc,
		`export function ${functionName}(this: IExecuteFunctions, i: number): ${returnType} {`,
		`\tconst ${paramName} = this.getNodeParameter('${paramName}', i, {}) as ${returnType};`,
		`\treturn ${paramName};`,
		`}`,
	].join('\n');

	return code;
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
