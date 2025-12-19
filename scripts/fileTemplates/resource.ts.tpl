import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	INodePropertyOptions,
	NodeOperationError,
} from 'n8n-workflow';
import {
	{{OPERATION_NAME_CONST}},
	option as {{OPERATION_KEY}}Option,
	properties as {{OPERATION_KEY}}Properties,
	execute as execute{{OPERATION_KEY_CAPITALIZED}},
} from './operations/{{OPERATION_KEY}}';

// Resource name constant
export const RESOURCE_NAME = '{{RESOURCE_NAME}}';

// Collect all operations for this resource
const operations: INodePropertyOptions[] = [{{OPERATION_KEY}}Option];

// Resource option for the resource selector
export const resourceOption: INodePropertyOptions = {
	name: RESOURCE_NAME,
	value: RESOURCE_NAME,
};

// Operation selector for this resource
export const operationSelect: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: [RESOURCE_NAME],
		},
	},
	default: operations.length > 0 ? operations[0].value : '',
	options: operations,
};

// All properties for this resource (operation selector + operation properties)
export const properties: INodeProperties[] = [
	operationSelect,
	...{{OPERATION_KEY}}Properties,
];

// Router for this resource
export async function router(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData | INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', i);

	switch (operation) {
		case {{OPERATION_NAME_CONST}}:
			return await execute{{OPERATION_KEY_CAPITALIZED}}.call(this, i);
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Operation ${operation} not found for resource ${RESOURCE_NAME}`,
			);
	}
}
