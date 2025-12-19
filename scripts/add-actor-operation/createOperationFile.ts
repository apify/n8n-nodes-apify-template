import * as fs from 'fs';
import * as path from 'path';
import type { INodeProperties } from 'n8n-workflow';
import type { ApifyInputSchema } from '../types.ts';
import { convertApifyToN8n } from '../init-actor-app/actorSchemaConverter.ts';
import chalk from 'chalk';

/**
 * Parse inputFunctions.ts to extract all function names
 */
function parseInputFunctions(inputFunctionsPath: string): string[] {
	const content = fs.readFileSync(inputFunctionsPath, 'utf-8');

	// Match all export function declarations
	const functionRegex = /export function (get[A-Z][a-zA-Z0-9]*)/g;
	const matches = [...content.matchAll(functionRegex)];

	return matches.map(match => match[1]);
}

/**
 * Extract parameter name from function name
 * getStartUrls -> startUrls
 * getUseSitemaps -> useSitemaps
 */
function extractParamName(functionName: string): string {
	// Remove 'get' prefix and lowercase first letter
	const withoutGet = functionName.replace(/^get/, '');
	return withoutGet.charAt(0).toLowerCase() + withoutGet.slice(1);
}

/**
 * Generate input function calls code
 * Only for required properties
 */
function generateInputFunctionCalls(functionNames: string[], requiredPropertyNames: string[]): string {
	// Filter to only function names that correspond to required properties
	const requiredFunctionNames = functionNames.filter(fnName => {
		const paramName = extractParamName(fnName);
		return requiredPropertyNames.includes(paramName);
	});

	return requiredFunctionNames.map(fnName => {
		const paramName = extractParamName(fnName);
		return `\tconst ${paramName} = inputFunctions.${fnName}.call(this, i);`;
	}).join('\n');
}

/**
 * Generate actor input properties code
 * Only for required properties
 */
function generateActorInputProperties(functionNames: string[], requiredPropertyNames: string[]): string {
	// Filter to only function names that correspond to required properties
	const requiredFunctionNames = functionNames.filter(fnName => {
		const paramName = extractParamName(fnName);
		return requiredPropertyNames.includes(paramName);
	});

	return requiredFunctionNames.map(fnName => {
		const paramName = extractParamName(fnName);
		return `\t\t${paramName},`;
	}).join('\n');
}

/**
 * Generate property function imports and calls
 * Only includes required properties by default
 */
function generatePropertyFunctions(
	inputSchema: ApifyInputSchema,
	operationConstName: string,
): { propertyFunctionImports: string; propertyFunctionCalls: string; optionalCount: number; requiredCount: number; requiredPropertyNames: string[] } {
	// Convert Apify schema to n8n properties
	const n8nProperties = convertApifyToN8n(inputSchema);

	// Filter to only required properties
	const requiredProperties = n8nProperties.filter(prop => prop.required === true);
	const optionalProperties = n8nProperties.filter(prop => !prop.required);

	// Get the names of required properties
	const requiredPropertyNames = requiredProperties.map(prop => prop.name);

	// Generate import statements
	const importFunctions = requiredProperties.map(prop => {
		const functionName = `get${capitalizeFirst(prop.name)}Property`;
		return functionName;
	});

	const propertyFunctionImports = importFunctions.length > 0
		? `import {\n\t${importFunctions.join(',\n\t')}\n} from '../../../helpers/propertyFunctions';`
		: '';

	// Generate function calls
	const propertyFunctionCalls = requiredProperties.map(prop => {
		const functionName = `get${capitalizeFirst(prop.name)}Property`;
		return `\t${functionName}(RESOURCE_NAME, ${operationConstName}),`;
	}).join('\n');

	return {
		propertyFunctionImports,
		propertyFunctionCalls,
		optionalCount: optionalProperties.length,
		requiredCount: requiredProperties.length,
		requiredPropertyNames,
	};
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
	if (!str) return '';
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Create operation file from template
 */
export async function createOperationFile(
	resourcePath: string,
	operationName: string,
	operationKey: string,
	operationDescription: string,
	inputSchema: ApifyInputSchema,
	nodeDir: string,
): Promise<void> {
	console.log(chalk.cyan('📝 Creating operation file...'));

	// Read the template
	const templatePath = path.join(__dirname, '../fileTemplates', 'operation.ts.tpl');
	let template = fs.readFileSync(templatePath, 'utf-8');

	// Parse input functions from the helpers directory
	const inputFunctionsPath = path.join(nodeDir, 'helpers', 'inputFunctions.ts');

	if (!fs.existsSync(inputFunctionsPath)) {
		throw new Error(`inputFunctions.ts not found at ${inputFunctionsPath}`);
	}

	const functionNames = parseInputFunctions(inputFunctionsPath);
	console.log(chalk.gray(`   Found ${functionNames.length} input functions`));

	// Generate operation constant name (e.g., "OPERATION_SCRAPE_DATA_NAME")
	const operationConstName = `OPERATION_${operationKey.replace(/([A-Z])/g, '_$1').toUpperCase()}_NAME`;

	// Generate property functions and get required property names
	const { propertyFunctionImports, propertyFunctionCalls, optionalCount, requiredCount, requiredPropertyNames } = generatePropertyFunctions(inputSchema, operationConstName);

	// Generate the code sections (only for required properties)
	const inputFunctionCalls = generateInputFunctionCalls(functionNames, requiredPropertyNames);
	const actorInputProperties = generateActorInputProperties(functionNames, requiredPropertyNames);

	// Replace all placeholders
	template = template
		.replace(/\{\{OPERATION_NAME_CONST\}\}/g, operationConstName)
		.replace(/\{\{OPERATION_NAME\}\}/g, operationName)
		.replace(/\{\{OPERATION_ACTION\}\}/g, operationName)
		.replace(/\{\{OPERATION_DESCRIPTION\}\}/g, operationDescription)
		.replace(/\{\{PROPERTY_FUNCTION_IMPORTS\}\}/g, propertyFunctionImports)
		.replace(/\{\{PROPERTY_FUNCTION_CALLS\}\}/g, propertyFunctionCalls)
		.replace(/\{\{INPUT_FUNCTION_CALLS\}\}/g, inputFunctionCalls)
		.replace(/\{\{ACTOR_INPUT_PROPERTIES\}\}/g, actorInputProperties);

	// Write the operation file
	const operationsDir = path.join(resourcePath, 'operations');
	if (!fs.existsSync(operationsDir)) {
		fs.mkdirSync(operationsDir, { recursive: true });
	}

	const operationFilePath = path.join(operationsDir, `${operationKey}.ts`);
	fs.writeFileSync(operationFilePath, template, 'utf-8');

	console.log(chalk.green(`✅ Created operation file: ${operationKey}.ts`));
	console.log(chalk.gray(`   Properties: ${requiredCount} required (${optionalCount} optional properties available but not included)`));
}

/**
 * Update resource.ts to include the new operation
 */
export async function updateResourceFile(
	resourcePath: string,
	operationName: string,
	operationKey: string,
): Promise<void> {
	console.log(chalk.cyan('📝 Updating resource.ts...'));

	const resourceFilePath = path.join(resourcePath, 'resource.ts');
	let content = fs.readFileSync(resourceFilePath, 'utf-8');

	// Generate operation constant name
	const operationConstName = `OPERATION_${operationKey.replace(/([A-Z])/g, '_$1').toUpperCase()}_NAME`;
	const operationNumber = operationKey.match(/\d+$/)?.[0] || ''; // Extract number if exists

	// 1. Add import statement after the last operation import
	const lastImportRegex = /import \{[^}]+\} from '\.\/operations\/[^']+';/g;
	const imports = content.match(lastImportRegex);

	if (imports && imports.length > 0) {
		const lastImport = imports[imports.length - 1];
		const newImport = `import {
	${operationConstName},
	option as ${operationKey}Option,
	properties as ${operationKey}Properties,
	execute as execute${operationKey.charAt(0).toUpperCase() + operationKey.slice(1)},
} from './operations/${operationKey}';`;

		content = content.replace(lastImport, `${lastImport}\n${newImport}`);
	}

	// 2. Add operation to operations array
	const operationsArrayRegex = /const operations: INodePropertyOptions\[\] = \[([^\]]*)\];/;
	const operationsMatch = content.match(operationsArrayRegex);

	if (operationsMatch) {
		const currentOperations = operationsMatch[1].trim();
		const newOperations = currentOperations
			? `${currentOperations}, ${operationKey}Option`
			: `${operationKey}Option`;
		content = content.replace(operationsArrayRegex, `const operations: INodePropertyOptions[] = [${newOperations}];`);
	}

	// 3. Add operation properties to properties array
	const propertiesArrayRegex = /export const properties: INodeProperties\[\] = \[([\s\S]*?)\];/;
	const propertiesMatch = content.match(propertiesArrayRegex);

	if (propertiesMatch) {
		const currentProperties = propertiesMatch[1];
		const newProperties = `${currentProperties.trimEnd()}\n\t...${operationKey}Properties,`;
		content = content.replace(propertiesArrayRegex, `export const properties: INodeProperties[] = [${newProperties}\n];`);
	}

	// 4. Add case to switch statement
	const switchRegex = /(switch \(operation\) \{[\s\S]*?)(default:)/;
	const switchMatch = content.match(switchRegex);

	if (switchMatch) {
		const executeFunction = `execute${operationKey.charAt(0).toUpperCase() + operationKey.slice(1)}`;
		const newCase = `\t\tcase ${operationConstName}:
			return await ${executeFunction}.call(this, i);
		`;
		content = content.replace(switchRegex, `$1${newCase}$2`);
	}

	// Write updated content
	fs.writeFileSync(resourceFilePath, content, 'utf-8');

	console.log(chalk.green('✅ Updated resource.ts'));
}
