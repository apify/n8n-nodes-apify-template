import { IExecuteFunctions, INodeExecutionData, NodeApiError } from 'n8n-workflow';
import { apiRequest, getResults, isUsedAsAiTool, pollRunStatus } from './genericFunctions';

export async function getDefaultBuild(this: IExecuteFunctions, actorId: string) {
	const defaultBuildResp = await apiRequest.call(this, {
		method: 'GET',
		uri: `/v2/acts/${actorId}/builds/default`,
	});
	if (!defaultBuildResp?.data) {
		throw new NodeApiError(this.getNode(), {
			message: `Could not fetch default build for actor ${actorId}`,
		});
	}
	return defaultBuildResp.data;
}

export function getDefaultInputsFromBuild(build: any) {
	const buildInputProperties = build?.actorDefinition?.input?.properties;
	const defaultInput: Record<string, any> = {};
	if (buildInputProperties && typeof buildInputProperties === 'object') {
		for (const [key, property] of Object.entries(buildInputProperties)) {
			if (
				property &&
				typeof property === 'object' &&
				'prefill' in property &&
				(property as any).prefill !== undefined &&
				(property as any).prefill !== null
			) {
				defaultInput[key] = (property as any).prefill;
			}
		}
	}
	return defaultInput;
}

export async function runActorApi(
	this: IExecuteFunctions,
	actorId: string,
	mergedInput: Record<string, any>,
	qs: Record<string, any>,
) {
	return await apiRequest.call(this, {
		method: 'POST',
		uri: `/v2/acts/${actorId}/runs`,
		body: mergedInput,
		qs,
	});
}

export async function executeActorRunFlow(
	this: IExecuteFunctions,
	actorId: string,
	mergedInput: Record<string, any>,
): Promise<INodeExecutionData> {
	const run = await runActorApi.call(this, actorId, mergedInput, { waitForFinish: 0 });
	if (!run?.data?.id) {
		throw new NodeApiError(this.getNode(), {
			message: `Run ID not found after running the actor`,
		});
	}

	const runId = run.data.id;
	const datasetId = run.data.defaultDatasetId;
	const lastRunData = await pollRunStatus.call(this, runId);
	const resultData = await getResults.call(this, datasetId);

	if (isUsedAsAiTool(this.getNode().type)) {
		return { json: { ...resultData } };
	}

	return { json: { ...lastRunData, ...resultData } };
}
