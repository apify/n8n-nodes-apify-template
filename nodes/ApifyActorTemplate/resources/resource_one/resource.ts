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
import {
	OPERATION_ANANZAAAAA_NAME,
	option as ananzaaaaaOption,
	properties as ananzaaaaaProperties,
	execute as executeAnanzaaaaa,
} from './operations/ananzaaaaa';
import {
	OPERATION_XS_NAME,
	option as xsOption,
	properties as xsProperties,
	execute as executeXs,
} from './operations/xs';
import {
	OPERATION_AKLSDL_NAME,
	option as aklsdlOption,
	properties as aklsdlProperties,
	execute as executeAklsdl,
} from './operations/aklsdl';
import {
	OPERATION_SX_NAME,
	option as sxOption,
	properties as sxProperties,
	execute as executeSx,
} from './operations/sx';

// Resource name constant
export const RESOURCE_NAME = '$$RESOURCE_NAME';

// Collect all operations for this resource
const operations: INodePropertyOptions[] = [operation1Option, operation2Option, ananzaaaaaOption, xsOption, aklsdlOption, sxOption];

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
	...ananzaaaaaProperties,
	...xsProperties,
	...aklsdlProperties,
	...sxProperties,
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
				case OPERATION_ANANZAAAAA_NAME:
			return await executeAnanzaaaaa.call(this, i);
				case OPERATION_XS_NAME:
			return await executeXs.call(this, i);
				case OPERATION_AKLSDL_NAME:
			return await executeAklsdl.call(this, i);
				case OPERATION_SX_NAME:
			return await executeSx.call(this, i);
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Operation ${operation} not found for resource ${RESOURCE_NAME}`,
			);
	}
}
