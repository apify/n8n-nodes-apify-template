import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { ACTOR_ID } from '../../../{{TARGET_CLASS_NAME}}.node';
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

{{PARAM_ASSIGNMENTS}}
{{SPECIAL_CASES}}

  return await executeActorRunFlow.call(this, ACTOR_ID, mergedInput);
}
