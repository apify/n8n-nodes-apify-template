import { IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { executeActorRun } from '../../../helpers/genericFunctions';
import { ACTOR_ID } from '../../../ApifyActorTemplate.node';
import { RESOURCE_NAME } from '../resource';
import * as inputFunctions from '../../../helpers/inputFunctions';

export const {{OPERATION_NAME_CONST}} = '{{OPERATION_NAME}}';
export const name = {{OPERATION_NAME_CONST}};

export const option: INodePropertyOptions = {
	name: {{OPERATION_NAME_CONST}},
	value: {{OPERATION_NAME_CONST}},
	action: '{{OPERATION_ACTION}}',
	description: '{{OPERATION_DESCRIPTION}}',
};

// NOTE: Only required properties are included by default.
// To add optional properties, copy them from the Actor's input schema
// and add displayOptions to show them for this operation.
export const properties: INodeProperties[] = [
	{{PROPERTIES}}
];

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	// Get all input parameters
{{INPUT_FUNCTION_CALLS}}

	const actorInput: Record<string, any> = {
{{ACTOR_INPUT_PROPERTIES}}
	};

	return await executeActorRun.call(this, ACTOR_ID, actorInput);
}
