import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	INodePropertyOptions,
	NodeOperationError,
} from 'n8n-workflow';
import {
	OPERATION_1_NAME,
	option as operation1Option,
	properties as operation1Properties,
	execute as executeOperation1,
} from './operations/operationOne';
import {
	OPERATION_2_NAME,
	option as operation2Option,
	properties as operation2Properties,
	execute as executeOperation2,
} from './operations/operation_two';

// Resource name constant
export const RESOURCE_NAME = '$$RESOURCE_NAME';

// Collect all operations for this resource
const operations: INodePropertyOptions[] = [operation1Option, operation2Option];

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
	...operation1Properties,
	...operation2Properties,
];

// Router for this resource
export async function router(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData | INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', i);

	switch (operation) {
		case OPERATION_1_NAME:
			return await executeOperation1.call(this, i);
		case OPERATION_2_NAME:
			return await executeOperation2.call(this, i);
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Operation ${operation} not found for resource ${RESOURCE_NAME}`,
			);
	}
}
