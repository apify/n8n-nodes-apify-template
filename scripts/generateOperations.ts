import fs from 'fs';
import path from 'path';

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
		await generateOperationFile(propertiesDir, op, TARGET_CLASS_NAME);
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
): Promise<void> {
	const fileName = `operation${operation.index}.ts`;
	const filePath = path.join(propertiesDir, fileName);

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

export const properties: INodeProperties[] = [
	{
		displayName: 'Parameter 1',
		name: 'param1',
		type: 'string',
		default: '',
		description: 'First parameter for this operation',
		placeholder: 'Enter value',
		displayOptions: {
			show: {
				resource: [RESOURCE_NAME],
				operation: [OPERATION_${operation.index}_NAME],
			},
		},
	},
	{
		displayName: 'Parameter 2',
		name: 'param2',
		type: 'string',
		default: '',
		description: 'Second parameter for this operation',
		placeholder: 'Enter value',
		displayOptions: {
			show: {
				resource: [RESOURCE_NAME],
				operation: [OPERATION_${operation.index}_NAME],
			},
		},
	},
	{
		displayName: 'Parameter 3',
		name: 'param3',
		type: 'number',
		default: 0,
		description: 'Third parameter for this operation',
		displayOptions: {
			show: {
				resource: [RESOURCE_NAME],
				operation: [OPERATION_${operation.index}_NAME],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const param1 = this.getNodeParameter('param1', i) as string;
	const param2 = this.getNodeParameter('param2', i) as string;
	const param3 = this.getNodeParameter('param3', i) as number;

	const actorInput: Record<string, any> = {
		param1,
		param2,
		param3,
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
