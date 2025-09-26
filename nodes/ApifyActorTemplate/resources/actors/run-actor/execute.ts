import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { ACTOR_ID } from '../../../ApifyActorTemplate.node';
import {
  getDefaultBuild,
  getDefaultInputsFromBuild,
  executeActorRunFlow,
} from '../../executeActor';

export async function runActor(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
  const build = await getDefaultBuild.call(this, ACTOR_ID);
  const defaultInput = getDefaultInputsFromBuild(build);

  const mergedInput: Record<string, any> = {
    ...defaultInput,
  };

  mergedInput["categoryUrls"] = this.getNodeParameter("categoryUrls", i);


  return await executeActorRunFlow.call(this, ACTOR_ID, mergedInput);
}
