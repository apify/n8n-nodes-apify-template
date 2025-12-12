import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	INodePropertyOptions,
	NodeOperationError,
} from 'n8n-workflow';
import {
	option as operation1Option,
	properties as operation1Properties,
	execute as executeOperation1,
} from './properties/operation1';
import {
	option as operation2Option,
	properties as operation2Properties,
	execute as executeOperation2,
} from './properties/operation2';

// SNIPPET 6: Operation and Resource name constants (modify these to customize)
export const RESOURCE_NAME = '$$RESOURCE_NAME';
export const OPERATION_1_NAME = 'Operation 1';
export const OPERATION_2_NAME = 'Operation 2';

const operations: INodePropertyOptions[] = [operation1Option, operation2Option];

const resourceSelect: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: '$$RESOURCE_NAME',
				value: '$$RESOURCE_NAME',
			},
		],
		default: '$$RESOURCE_NAME',
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
	...operation1Properties,
	...operation2Properties,
];

export const methods = {};

export async function router(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData | INodeExecutionData[]> {
	const resource = this.getNodeParameter('resource', 0);
	const operation = this.getNodeParameter('operation', i);

	if (resource !== RESOURCE_NAME) {
		throw new NodeOperationError(this.getNode(), `Resource ${resource} not found`);
	}

	switch (operation) {
		case OPERATION_1_NAME:
			return await executeOperation1.call(this, i);
		case OPERATION_2_NAME:
			return await executeOperation2.call(this, i);
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Operation ${operation} not found. Please use correct operation.`,
			);
	}
}
