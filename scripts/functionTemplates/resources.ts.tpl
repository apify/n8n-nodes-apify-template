import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	INodePropertyOptions,
	NodeOperationError,
} from 'n8n-workflow';
{{IMPORTS}}

// SNIPPET 6: Operation and Resource name constants (modify these to customize)
export const RESOURCE_NAME = '$$RESOURCE_NAME';
{{OPERATION_CONSTANTS}}

const operations: INodePropertyOptions[] = [{{OPERATIONS_ARRAY}}];

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
{{PROPERTIES_SPREAD}}
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
{{SWITCH_CASES}}
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Operation ${operation} not found. Please use correct operation.`,
			);
	}
}
