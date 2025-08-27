import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { ACTOR_ID } from '../../../ApifyRagWebBrowser.node';
import { properties } from './properties'; // <-- import generated properties
import {
  getDefaultBuild,
  getDefaultInputsFromBuild,
  executeActorRunFlow,
} from '../../executeActor';

export function getParamValue(
  ctx: IExecuteFunctions,
  name: string,
  i: number,
  properties: INodeProperties[],
): any {
  const propDef = properties.find((p) => p.name === name);
  let val = ctx.getNodeParameter(name, i);

  if (propDef?.type === 'json' && typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val; // leave as string if not valid JSON
    }
  }

  return val;
}

export async function runActor(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
  const build = await getDefaultBuild.call(this, ACTOR_ID);
  const defaultInput = getDefaultInputsFromBuild(build);

  const mergedInput: Record<string, any> = {
    ...defaultInput,
  };

  // List all parameter names you want to collect from the schema
  const paramNames = [
    'query',
    'maxResults',
    'outputFormats',
    'requestTimeoutSecs',
    'serpProxyGroup',
    'serpMaxRetries',
    'proxyConfiguration',
    'scrapingTool',
    'removeElementsCssSelector',
    'htmlTransformer',
    'desiredConcurrency',
    'maxRequestRetries',
    'dynamicContentWaitSecs',
    'removeCookieWarnings',
    'debugMode',
  ];

  for (const name of paramNames) {
    mergedInput[name] = getParamValue(this, name, i, properties);
  }

  return await executeActorRunFlow.call(this, ACTOR_ID, mergedInput);
}
