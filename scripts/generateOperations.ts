import fs from 'fs';
import path from 'path';
import type { ApifyClient, Actor } from 'apify-client';
import type { INodeProperties } from 'n8n-workflow';
import { createActorAppSchemaForN8n } from './actorSchemaConverter.ts';

interface OperationTemplate {
	name: string;
	value: string;
	index: number;
}

/**
 * Generate N operation files based on template
 */
export async function generateOperationsStructure(
	operationCount: number,
	TARGET_CLASS_NAME: string,
	newClassName: string,
	displayName: string,
	client: ApifyClient,
	actor: Actor,
): Promise<void> {
	const nodeDir = path.join('./nodes', TARGET_CLASS_NAME);
	const resourcesDir = path.join(nodeDir, 'resources');
	const propertiesDir = path.join(resourcesDir, 'properties');

	// Create directories
	if (!fs.existsSync(resourcesDir)) {
		fs.mkdirSync(resourcesDir, { recursive: true });
	}
	if (!fs.existsSync(propertiesDir)) {
		fs.mkdirSync(propertiesDir, { recursive: true });
	}

	// Fetch Actor schema and convert to n8n properties
	console.log('⚙️  Fetching properties from actor input schema...');
	const actorProperties = (await createActorAppSchemaForN8n(client, actor)) as INodeProperties[];

	// Generate operation files
	const operations: OperationTemplate[] = [];
	for (let i = 1; i <= operationCount; i++) {
		operations.push({
			name: `Operation ${i}`,
			value: `Operation ${i}`,
			index: i,
		});
	}

	// Generate each operation file
	for (const op of operations) {
		await generateOperationFile(propertiesDir, op, TARGET_CLASS_NAME, actorProperties);
	}

	// Generate resources.ts
	await generateResourcesFile(resourcesDir, operations, TARGET_CLASS_NAME, displayName);

	console.log(`✅ Generated ${operationCount} operation(s) in resources/ structure`);
}

/**
 * Generate individual operation file
 */
async function generateOperationFile(
	propertiesDir: string,
	operation: OperationTemplate,
	TARGET_CLASS_NAME: string,
	actorProperties: INodeProperties[],
): Promise<void> {
	const fileName = `operation${operation.index}.ts`;
	const filePath = path.join(propertiesDir, fileName);

	// Add displayOptions to each property to show only for this operation
	const propertiesWithDisplayOptions = actorProperties.map((prop) => ({
		...prop,
		displayOptions: {
			show: {
				resource: ['RESOURCE_NAME'],
				operation: [`OPERATION_${operation.index}_NAME`],
			},
		},
	}));

	// Generate properties as JSON string
	const propertiesJson = JSON.stringify(propertiesWithDisplayOptions, null, 2)
		.replace(/"RESOURCE_NAME"/g, 'RESOURCE_NAME')
		.replace(/"OPERATION_(\d+)_NAME"/g, 'OPERATION_$1_NAME');

	// Generate parameter retrieval code
	const paramAssignments = actorProperties.map((prop) => {
		if (prop.type === 'fixedCollection') {
			// Handle fixedCollection types (arrays)
			const optionName = prop.options?.[0]?.name || 'items';
			return `		...((() => {
			const ${prop.name} = this.getNodeParameter('${prop.name}', i, {}) as { ${optionName}?: { value: string }[] };
			return ${prop.name}?.${optionName}?.length ? { ${prop.name}: ${prop.name}.${optionName}.map(e => e.value) } : {};
		})()),`;
		} else if (prop.type === 'json') {
			// Handle JSON types with parsing
			return `		...((() => {
			try {
				const rawValue = this.getNodeParameter('${prop.name}', i);
				return { ${prop.name}: typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue };
			} catch (error) {
				throw new Error(\`Invalid JSON in parameter "${prop.name}": \${(error as Error).message}\`);
			}
		})()),`;
		} else {
			// Simple property assignment
			return `		${prop.name}: this.getNodeParameter('${prop.name}', i),`;
		}
	}).join('\n');

	const content = `import { IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { executeActorRun } from '../../helpers/genericFunctions';
import { ACTOR_ID } from '../../${TARGET_CLASS_NAME}.node';
import { RESOURCE_NAME, OPERATION_${operation.index}_NAME } from '../resources';

export const name = OPERATION_${operation.index}_NAME;

export const option: INodePropertyOptions = {
	name: OPERATION_${operation.index}_NAME,
	value: OPERATION_${operation.index}_NAME,
	action: 'Execute operation ${operation.index}',
	description: 'Description for operation ${operation.index}',
};

export const properties: INodeProperties[] = ${propertiesJson};

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const actorInput: Record<string, any> = {
${paramAssignments}
	};

	return await executeActorRun.call(this, ACTOR_ID, actorInput);
}
`;

	fs.writeFileSync(filePath, content, 'utf-8');
	console.log(`✅ Created ${fileName}`);
}

/**
 * Generate resources.ts router file
 */
async function generateResourcesFile(
	resourcesDir: string,
	operations: OperationTemplate[],
	TARGET_CLASS_NAME: string,
	displayName: string,
): Promise<void> {
	const filePath = path.join(resourcesDir, 'resources.ts');

	// Generate imports
	const imports = operations
		.map(
			(op) => `import {
	option as operation${op.index}Option,
	properties as operation${op.index}Properties,
	execute as executeOperation${op.index},
} from './properties/operation${op.index}';`,
		)
		.join('\n');

	// Generate operation name constants
	const operationConstants = operations
		.map((op) => `export const OPERATION_${op.index}_NAME = '${op.name}';`)
		.join('\n');

	// Generate operations array
	const operationsArray = operations.map((op) => `operation${op.index}Option`).join(', ');

	// Generate switch cases
	const switchCases = operations
		.map(
			(op) => `		case OPERATION_${op.index}_NAME:
			return await executeOperation${op.index}.call(this, i);`,
		)
		.join('\n');

	// Generate properties spread
	const propertiesSpread = operations
		.map((op) => `	...operation${op.index}Properties,`)
		.join('\n');

	// Generate export list for SNIPPET 6
	const exportList = operations.map((op) => `OPERATION_${op.index}_NAME`).join(', ');

	const content = `import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	INodePropertyOptions,
	NodeOperationError,
} from 'n8n-workflow';
${imports}

// SNIPPET 6: Operation and Resource name constants (modify these to customize)
export const RESOURCE_NAME = '$$RESOURCE_NAME';
${operationConstants}

const operations: INodePropertyOptions[] = [${operationsArray}];

const resourceSelect: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: RESOURCE_NAME,
				value: RESOURCE_NAME,
			},
		],
		default: RESOURCE_NAME,
	},
];

const operationSelect: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: [RESOURCE_NAME],
		},
	},
	default: '',
	options: operations,
};

operationSelect.default = operations.length > 0 ? operations[0].value : '';

const authenticationProperties: INodeProperties[] = [
	{
		displayName: 'Authentication',
		name: 'authentication',
		type: 'options',
		options: [
			{ name: 'API Key', value: 'apifyApi' },
			{ name: 'OAuth2', value: 'apifyOAuth2Api' },
		],
		default: 'apifyApi',
		description: 'Choose which authentication method to use',
	},
];

export const properties: INodeProperties[] = [
	...authenticationProperties,
	...resourceSelect,
	operationSelect,
${propertiesSpread}
];

export const methods = {};

export async function router(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData | INodeExecutionData[]> {
	const resource = this.getNodeParameter('resource', 0);
	const operation = this.getNodeParameter('operation', i);

	if (resource !== RESOURCE_NAME) {
		throw new NodeOperationError(this.getNode(), \`Resource \${resource} not found\`);
	}

	switch (operation) {
${switchCases}
		default:
			throw new NodeOperationError(
				this.getNode(),
				\`Operation \${operation} not found. Please use correct operation.\`,
			);
	}
}
`;

	fs.writeFileSync(filePath, content, 'utf-8');
	console.log(`✅ Created resources.ts`);
}
