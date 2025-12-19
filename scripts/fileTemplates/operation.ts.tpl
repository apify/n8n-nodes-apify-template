import { IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { executeActorRun } from '../../../helpers/genericFunctions';
import { ACTOR_ID } from '../../../ApifyActorTemplate.node';
import { RESOURCE_NAME } from '../resource';
import * as inputFunctions from '../../../helpers/inputFunctions';
{{PROPERTY_FUNCTION_IMPORTS}}

export const {{OPERATION_NAME_CONST}} = '{{OPERATION_NAME}}';
export const name = {{OPERATION_NAME_CONST}};

export const option: INodePropertyOptions = {
	name: {{OPERATION_NAME_CONST}},
	value: {{OPERATION_NAME_CONST}},
	action: '{{OPERATION_ACTION}}',
	description: '{{OPERATION_DESCRIPTION}}',
};

// NOTE: Only required properties are included by default.
// To add optional properties, import the property function from propertyFunctions.ts
// and add it to the properties array below.
export const properties: INodeProperties[] = [
{{PROPERTY_FUNCTION_CALLS}}
];

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	// Get required input parameters by default
{{INPUT_FUNCTION_CALLS}}

	const actorInput: Record<string, any> = {
{{ACTOR_INPUT_PROPERTIES}}
	};

	return await executeActorRun.call(this, ACTOR_ID, actorInput);
}
