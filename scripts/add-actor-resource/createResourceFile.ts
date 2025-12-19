import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
	if (!str) return '';
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate operation constant name from operation key
 * "scrapeData" -> "OPERATION_SCRAPE_DATA_NAME"
 */
export function generateOperationConstName(operationKey: string): string {
	return `OPERATION_${operationKey.replace(/([A-Z])/g, '_$1').toUpperCase()}_NAME`;
}

/**
 * Create resource folder with resource.ts file from template
 */
export async function createResourceFile(
	nodeDir: string,
	resourceName: string,
	resourceKey: string,
	_operationName: string,
	operationKey: string,
): Promise<string> {
	console.log(chalk.cyan('📝 Creating resource folder and file...'));

	// Read the template
	const templatePath = path.join(__dirname, '../templates', 'resource.ts.tpl');
	let template = fs.readFileSync(templatePath, 'utf-8');

	// Generate operation constant name
	const operationConstName = generateOperationConstName(operationKey);

	// Replace all placeholders
	template = template
		.replace(/\{\{RESOURCE_NAME\}\}/g, resourceName)
		.replace(/\{\{OPERATION_NAME_CONST\}\}/g, operationConstName)
		.replace(/\{\{OPERATION_KEY\}\}/g, operationKey)
		.replace(/\{\{OPERATION_KEY_CAPITALIZED\}\}/g, capitalizeFirst(operationKey));

	// Create resource folder
	const resourcePath = path.join(nodeDir, 'resources', resourceKey);
	fs.mkdirSync(resourcePath, { recursive: true });

	// Create operations folder
	const operationsPath = path.join(resourcePath, 'operations');
	fs.mkdirSync(operationsPath, { recursive: true });

	// Write the resource file
	const resourceFilePath = path.join(resourcePath, 'resource.ts');
	fs.writeFileSync(resourceFilePath, template, 'utf-8');

	console.log(chalk.green(`✅ Created resource folder: ${resourceKey}/`));
	console.log(chalk.green(`✅ Created resource file: ${resourceKey}/resource.ts`));

	return resourcePath;
}

/**
 * Get the next resource number by scanning existing resources in router.ts
 */
function getNextResourceNumber(routerContent: string): number {
	// Find all existing resource imports (RESOURCE_X_NAME pattern)
	const resourcePattern = /RESOURCE_(\d+)_NAME/g;
	const matches = [...routerContent.matchAll(resourcePattern)];

	if (matches.length === 0) {
		return 1; // Start with 1 if no numbered resources (empty router)
	}

	const numbers = matches.map(m => parseInt(m[1], 10));
	return Math.max(...numbers) + 1;
}

/**
 * Check if router is empty (has no resources)
 */
function isEmptyRouter(routerContent: string): boolean {
	// Check if there are any resource imports
	const resourceImportPattern = /} from '\.\/[^']+\/resource';/;
	return !resourceImportPattern.test(routerContent);
}

/**
 * Update router.ts to include the new resource
 */
export async function updateRouterFile(
	nodeDir: string,
	resourceName: string,
	resourceKey: string,
	operationKey: string,
): Promise<void> {
	console.log(chalk.cyan('📝 Updating router.ts...'));

	const routerPath = path.join(nodeDir, 'resources', 'router.ts');
	let content = fs.readFileSync(routerPath, 'utf-8');

	// Get the next resource number
	const resourceNumber = getNextResourceNumber(content);
	const resourceVarName = `resource${resourceNumber}`;
	const resourceConstName = `RESOURCE_${resourceNumber}_NAME`;

	// Generate operation constant name
	const operationConstName = generateOperationConstName(operationKey);

	// Check if this is an empty router (first resource)
	const isEmpty = isEmptyRouter(content);

	if (isEmpty) {
		// For empty router, add import after the n8n-workflow import
		const newImport = `import {
	RESOURCE_NAME as ${resourceConstName},
	resourceOption as ${resourceVarName}Option,
	properties as ${resourceVarName}Properties,
	router as ${resourceVarName}Router,
} from './${resourceKey}/resource';

// Re-export resource and operation names for backward compatibility
export const RESOURCE_NAME = ${resourceConstName};
export { ${operationConstName} } from './${resourceKey}/operations/${operationKey}';`;

		// Insert after the n8n-workflow import
		content = content.replace(
			/} from 'n8n-workflow';/,
			`} from 'n8n-workflow';\n${newImport}`
		);
	} else {
		// For non-empty router, add import after the last resource import
		const lastImportRegex = /} from '\.\/[^']+\/resource';/g;
		const imports = content.match(lastImportRegex);

		if (imports && imports.length > 0) {
			const lastImport = imports[imports.length - 1];
			const newImport = `import {
	RESOURCE_NAME as ${resourceConstName},
	resourceOption as ${resourceVarName}Option,
	properties as ${resourceVarName}Properties,
	router as ${resourceVarName}Router,
} from './${resourceKey}/resource';`;

			content = content.replace(lastImport, `${lastImport}\n${newImport}`);
		}

		// Add operation export after last operation export
		const lastOperationExportRegex = /export \{ [A-Z_0-9]+ \} from '\.\/[^']+\/operations\/[^']+'/g;
		const operationExports = content.match(lastOperationExportRegex);

		if (operationExports && operationExports.length > 0) {
			const lastExport = operationExports[operationExports.length - 1];
			const newExport = `export { ${operationConstName} } from './${resourceKey}/operations/${operationKey}'`;
			content = content.replace(lastExport, `${lastExport}\n${newExport}`);
		}
	}

	// 3. Add resource to options array and update default
	const resourceOptionsRegex = /options: \[([\s\S]*?)\],\s*default:\s*([^,\n}]+)/;
	const optionsMatch = content.match(resourceOptionsRegex);

	if (optionsMatch) {
		const currentOptions = optionsMatch[1].trim();
		const currentDefault = optionsMatch[2].trim();

		// Determine new default (use first resource if empty)
		const newDefault = isEmpty ? resourceConstName : currentDefault;

		// Check if there's a comment at the end
		if (currentOptions.includes('// Add more resource options')) {
			const newOptions = currentOptions.replace(
				'// Add more resource options here as you create them',
				`${resourceVarName}Option,\n\t\t\t// Add more resource options here as you create them`
			);
			content = content.replace(resourceOptionsRegex, `options: [\n\t\t\t${newOptions}\n\t\t],\n\t\tdefault: ${newDefault}`);
		} else {
			const newOptions = currentOptions.endsWith(',')
				? `${currentOptions}\n\t\t\t${resourceVarName}Option,`
				: `${currentOptions},\n\t\t\t${resourceVarName}Option,`;
			content = content.replace(resourceOptionsRegex, `options: [\n\t\t\t${newOptions}\n\t\t],\n\t\tdefault: ${newDefault}`);
		}
	}

	// 4. Add resource properties to properties array
	const propertiesArrayRegex = /export const properties: INodeProperties\[\] = \[([\s\S]*?)\];/;
	const propertiesMatch = content.match(propertiesArrayRegex);

	if (propertiesMatch) {
		const currentProperties = propertiesMatch[1];
		// Check if there's a comment at the end
		if (currentProperties.includes('// Add more resource properties')) {
			const newProperties = currentProperties.replace(
				'// Add more resource properties here as you create them',
				`...${resourceVarName}Properties,\n\t// Add more resource properties here as you create them`
			);
			content = content.replace(propertiesArrayRegex, `export const properties: INodeProperties[] = [${newProperties}];`);
		} else {
			const newProperties = `${currentProperties.trimEnd()}\n\t...${resourceVarName}Properties,`;
			content = content.replace(propertiesArrayRegex, `export const properties: INodeProperties[] = [${newProperties}\n];`);
		}
	}

	// 5. Add case to switch statement - insert before the comment or default
	const switchRegex = /(switch \(resource\) \{[\s\S]*?)(\/\/ Add more resource cases here as you create them\n\t\tdefault:|default:)/;
	const switchMatch = content.match(switchRegex);

	if (switchMatch) {
		const newCase = `case ${resourceConstName}:
			return await ${resourceVarName}Router.call(this, i);
		`;
		// Insert the new case before the comment/default, preserving the comment/default
		content = content.replace(switchRegex, `$1${newCase}$2`);
	}

	// Write updated content
	fs.writeFileSync(routerPath, content, 'utf-8');

	console.log(chalk.green('✅ Updated router.ts'));
}
