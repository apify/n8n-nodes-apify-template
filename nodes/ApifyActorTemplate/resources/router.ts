import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	NodeOperationError,
} from 'n8n-workflow';
import {
	RESOURCE_NAME as RESOURCE_1_NAME,
	resourceOption as resource1Option,
	properties as resource1Properties,
	router as resource1Router,
} from './resource_one/resource';

// Re-export resource and operation names for backward compatibility
export const RESOURCE_NAME = RESOURCE_1_NAME;
export { OPERATION_1_NAME } from './resource_one/operations/operation_one';
export { OPERATION_2_NAME } from './resource_one/operations/operation_two'

// Resource selector with all resources
const resourceSelect: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			resource1Option,
			// Add more resource options here as you create them
		],
		default: RESOURCE_1_NAME,
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
	...resource1Properties,
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
		case RESOURCE_1_NAME:
			return await resource1Router.call(this, i);
		// Add more resource cases here as you create them
		default:
			throw new NodeOperationError(this.getNode(), `Resource ${resource} not found`);
	}
}
