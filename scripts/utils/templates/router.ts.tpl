import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	NodeOperationError,
} from 'n8n-workflow';

// Resource selector with all resources
const resourceSelect: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			// Add more resource options here as you create them
		],
		default: '',
	},
];

// Authentication properties
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

// All properties exported to the main node
export const properties: INodeProperties[] = [
	...authenticationProperties,
	...resourceSelect,
	// Add more resource properties here as you create them
];

export const methods = {};

// Main router that delegates to resource-specific routers
export async function router(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData | INodeExecutionData[]> {
	const resource = this.getNodeParameter('resource', 0);

	switch (resource) {
		// Add more resource cases here as you create them
		default:
			throw new NodeOperationError(this.getNode(), `Resource ${resource} not found`);
	}
}
