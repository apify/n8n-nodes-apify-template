import { IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { executeActorRun } from '../../helpers/genericFunctions';
import { ACTOR_ID } from '../../{{TARGET_CLASS_NAME}}.node';
import { RESOURCE_NAME, OPERATION_{{INDEX}}_NAME } from '../resources';

export const name = OPERATION_{{INDEX}}_NAME;

export const option: INodePropertyOptions = {
	name: OPERATION_{{INDEX}}_NAME,
	value: OPERATION_{{INDEX}}_NAME,
	action: 'Execute operation {{INDEX}}',
	description: 'Description for operation {{INDEX}}',
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
				operation: [OPERATION_{{INDEX}}_NAME],
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
				operation: [OPERATION_{{INDEX}}_NAME],
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
				operation: [OPERATION_{{INDEX}}_NAME],
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
