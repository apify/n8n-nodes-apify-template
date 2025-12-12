import {
	NodeApiError,
	NodeOperationError,
	sleep,
	type IExecuteFunctions,
	type IHookFunctions,
	type ILoadOptionsFunctions,
	type IHttpRequestOptions,
} from 'n8n-workflow';
import { ClassNameCamel, X_PLATFORM_APP_HEADER_ID, X_PLATFORM_HEADER_ID } from '../ApifyActorTemplate.node';

/**
 * Extended request options for Apify API calls
 */
type IApiRequestOptions = Omit<IHttpRequestOptions, 'url'> & {
	uri?: string;
	url?: string; // make optional to satisfy the interface
};

/**
 * Make an API request to Apify (modern version using IHttpRequestOptions)
 */
export async function apiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	requestOptions: IApiRequestOptions,
): Promise<any> {
	const { method = 'GET', qs, uri, ...rest } = requestOptions;

	const query = qs || {};
	const endpoint = `https://api.apify.com${uri ?? ''}`;

	const headers: Record<string, string> = {
		'x-apify-integration-platform': X_PLATFORM_HEADER_ID,
		...(X_PLATFORM_APP_HEADER_ID && { 'x-apify-integration-app-id': X_PLATFORM_APP_HEADER_ID }),
	};

	if (isUsedAsAiTool(this.getNode().type)) {
		headers['x-apify-integration-ai-tool'] = 'true';
	}

	// Final merged options with proper IHttpRequestOptions shape
	const options: IHttpRequestOptions = {
		...rest,
		method,
		qs: query,
		url: endpoint,
		headers,
		json: true,
	};

	// Remove body if GET
	if (method === 'GET' && 'body' in options) {
		delete options.body;
	}

	try {
		const authenticationMethod = this.getNodeParameter('authentication', 0) as string;

		try {
			await this.getCredentials(authenticationMethod);
		} catch {
			throw new NodeOperationError(
				this.getNode(),
				`No valid credentials found for ${authenticationMethod}. Please configure them first.`,
			);
		}

		return await this.helpers.httpRequestWithAuthentication.call(
			this,
			authenticationMethod,
			options,
		);
	} catch (error) {
		if (error instanceof NodeApiError) throw error;

		if (error.response?.body) {
			throw new NodeApiError(this.getNode(), error, {
				message: error.response.body,
				description: error.message,
			});
		}

		throw new NodeApiError(this.getNode(), error);
	}
}

/**
 * Detect if used from an AI Agent tool
 */
export function isUsedAsAiTool(nodeType: string): boolean {
	const parts = nodeType.split('.');
	return parts[parts.length - 1] === `${ClassNameCamel}Tool`;
}

/**
 * Poll the Apify run until completion
 */
export async function pollRunStatus(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	runId: string,
): Promise<any> {
	let lastRunData: any;
	while (true) {
		try {
			const pollResult = await apiRequest.call(this, {
				method: 'GET',
				uri: `/v2/actor-runs/${runId}`,
			});

			const status = pollResult?.data?.status;
			lastRunData = pollResult?.data;
			if (['SUCCEEDED', 'FAILED', 'TIMED-OUT', 'ABORTED'].includes(status)) break;
		} catch (err) {
			throw new NodeApiError(this.getNode(), {
				message: `Error polling run status: ${err}`,
			});
		}
		await sleep(1000);
	}
	return lastRunData;
}

/**
 * Fetch dataset results and optionally trim to markdown for AI tool usage
 */
export async function getResults(this: IExecuteFunctions, datasetId: string): Promise<any> {
	const results = await apiRequest.call(this, {
		method: 'GET',
		uri: `/v2/datasets/${datasetId}/items`,
	});

	// SNIPPET 5: AI Agent tool usage optimizations
	// It might be beneficial to remove fields like run info etc. This helps with the context limits of LLM's
	// EXAMPLE BELOW: Leaves only relevant markdown result reducing total context usage
	if (isUsedAsAiTool(this.getNode().type)) {
		// results = results.map((item: any) => ({ markdown: item.markdown }));
	}

	return this.helpers.returnJsonArray(results);
}

/**
 * Get the default build for an actor
 */
export async function getDefaultBuild(
	this: IExecuteFunctions,
	actorId: string,
): Promise<any> {
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

/**
 * Extract default input values from actor build definition
 */
export function getDefaultInputsFromBuild(build: any): Record<string, any> {
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

/**
 * Run an actor with the given input
 */
export async function runActorApi(
	this: IExecuteFunctions,
	actorId: string,
	mergedInput: Record<string, any>,
	qs: Record<string, any>,
): Promise<any> {
	return await apiRequest.call(this, {
		method: 'POST',
		uri: `/v2/acts/${actorId}/runs`,
		body: mergedInput,
		qs,
	});
}

/**
 * Execute an actor run with the given input and wait for results
 * This is the common execution pattern shared by all operations
 */
export async function executeActorRun(
	this: IExecuteFunctions,
	actorId: string,
	actorInput: Record<string, any>,
): Promise<any> {
	const build = await getDefaultBuild.call(this, actorId);
	const defaultInput = getDefaultInputsFromBuild(build);

	const mergedInput = {
		...defaultInput,
		...actorInput,
	};

	const run = await runActorApi.call(this, actorId, mergedInput, { waitForFinish: 0 });
	if (!run?.data?.id) {
		throw new NodeApiError(this.getNode(), {
			message: `Run ID not found after running the actor`,
		});
	}

	const runId = run.data.id;
	const datasetId = run.data.defaultDatasetId;

	await pollRunStatus.call(this, runId);
	return await getResults.call(this, datasetId);
}

