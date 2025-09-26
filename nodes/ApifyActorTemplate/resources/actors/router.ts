import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import { runActor } from './run-actor/execute';

export async function actorsRouter(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData | INodeExecutionData[]> {
	return await runActor.call(this, i);
}