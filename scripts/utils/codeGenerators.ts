import * as fs from 'fs';
import * as path from 'path';
import type { INodeProperties } from 'n8n-workflow';

/**
 * Capitalize first letter of a string
 */
function capitalizeFirst(str: string): string {
	if (!str) return '';
	return str.charAt(0).toUpperCase() + str.slice(1);
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
 * Generate getter for regular properties (string, number, boolean, etc.)
 */
function generateRegularGetter(prop: INodeProperties): string {
	const paramName = prop.name;
	const functionName = `get${capitalizeFirst(paramName)}`;
	const tsType = getTypeScriptType(prop.type as string);

	// For JSON types, use JSON template
	if (prop.type === 'json') {
		const templatePath = path.join(__dirname, '../templates', 'functionTemplates', 'jsonGetter.ts.tpl');
		let template = fs.readFileSync(templatePath, 'utf-8');
		template = template.replace(/{{PARAM_NAME}}/g, paramName);
		template = template.replace(/{{FUNCTION_NAME}}/g, functionName);
		return template;
	}

	// For regular types, use regular template
	const templatePath = path.join(__dirname, '../templates', 'functionTemplates', 'regularGetter.ts.tpl');
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
		const templatePath = path.join(__dirname, '../templates', 'functionTemplates', 'stringListGetter.ts.tpl');
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
	const templatePath = path.join(__dirname, '../templates', 'functionTemplates', 'fixedCollectionGetter.ts.tpl');
	let template = fs.readFileSync(templatePath, 'utf-8');
	template = template.replace(/{{PARAM_NAME}}/g, paramName);
	template = template.replace(/{{FUNCTION_NAME}}/g, functionName);
	template = template.replace(/{{COLLECTION_NAME}}/g, collectionName);
	template = template.replace(/{{ENTRY_TYPE}}/g, entryType);
	template = template.replace(/{{ARRAY_RETURN_TYPE}}/g, arrayReturnType);
	return template;
}

/**
 * Generate all getter functions for input parameters
 */
export function generateAllGetterFunctions(properties: INodeProperties[]): string {
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
 * Generate all property functions
 */
export function generateAllPropertyFunctions(properties: INodeProperties[]): string {
	const functions: string[] = [];

	for (const prop of properties) {
		functions.push(generatePropertyFunction(prop));
	}

	return functions.join('\n\n');
}

/**
 * Generate inputFunctions.ts file
 */
export function generateInputFunctionsFile(nodeDir: string, properties: INodeProperties[]): void {
	const functionsCode = generateAllGetterFunctions(properties);

	const templatePath = path.join(__dirname, '../templates', 'inputFunctions.ts.tpl');
	let template = fs.readFileSync(templatePath, 'utf-8');
	template = template.replace('{{FUNCTIONS}}', functionsCode);

	const outputPath = path.join(nodeDir, 'helpers', 'inputFunctions.ts');
	fs.mkdirSync(path.dirname(outputPath), { recursive: true });
	fs.writeFileSync(outputPath, template, 'utf-8');
}

/**
 * Generate propertyFunctions.ts file
 */
export function generatePropertyFunctionsFile(nodeDir: string, properties: INodeProperties[]): void {
	const functionsCode = generateAllPropertyFunctions(properties);

	const templatePath = path.join(__dirname, '../templates', 'propertyFunctions.ts.tpl');
	let template = fs.readFileSync(templatePath, 'utf-8');
	template = template.replace('{{FUNCTIONS}}', functionsCode);

	const outputPath = path.join(nodeDir, 'helpers', 'propertyFunctions.ts');
	fs.mkdirSync(path.dirname(outputPath), { recursive: true });
	fs.writeFileSync(outputPath, template, 'utf-8');
}
