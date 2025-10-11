import {
	NodeApiError,
	NodeOperationError,
	sleep,
	type IDataObject,
	type IExecuteFunctions,
	type IHookFunctions,
	type ILoadOptionsFunctions,
	type IRequestOptions,
} from 'n8n-workflow';
import { ClassNameCamel, X_PLATFORM_APP_HEADER_ID, X_PLATFORM_HEADER_ID } from '../ApifyActorTemplate.node';

type IApiRequestOptions = IRequestOptions & { uri?: string };

/**
 * Make an API request to Apify
 *
 */
export async function apiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	requestOptions: IApiRequestOptions,
): Promise<any> {
	const { method, qs, uri, ...rest } = requestOptions;

	const query = qs || {};
	const endpoint = `https://api.apify.com${uri}`;

	const options: IRequestOptions = {
		json: true,
		...rest,
		method,
		qs: query,
		url: endpoint,
		headers: {
			'x-apify-integration-platform': X_PLATFORM_HEADER_ID,
			...(X_PLATFORM_APP_HEADER_ID && { 'x-apify-integration-app-id': X_PLATFORM_APP_HEADER_ID }),
		},
	};

	if (method === 'GET') {
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

		return await this.helpers.requestWithAuthentication.call(this, authenticationMethod, options);
	} catch (error) {
		/**
		 * using `error instanceof NodeApiError` results in `false`
		 * because it's thrown by a different instance of n8n-workflow
		 */
		if (error instanceof NodeApiError) {
			throw error;
		}

		if (error.response && error.response.body) {
			throw new NodeApiError(this.getNode(), error, {
				message: error.response.body,
				description: error.message,
			});
		}

		throw new NodeApiError(this.getNode(), error);
	}
}

export async function apiRequestAllItems(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	requestOptions: IApiRequestOptions,
): Promise<any> {
	const returnData: IDataObject[] = [];
	if (!requestOptions.qs) requestOptions.qs = {};
	requestOptions.qs.limit = requestOptions.qs.limit || 999;

	let responseData;

	do {
		responseData = await apiRequest.call(this, requestOptions);
		returnData.push(responseData);
	} while (requestOptions.qs.limit <= responseData.length);

	const combinedData = {
		data: {
			total: 0,
			count: 0,
			offset: 0,
			limit: 0,
			desc: false,
			items: [] as IDataObject[],
		},
	};

	for (const result of returnData) {
		combinedData.data.total += typeof result.total === 'number' ? result.total : 0;
		combinedData.data.count += typeof result.count === 'number' ? result.count : 0;
		combinedData.data.offset += typeof result.offset === 'number' ? result.offset : 0;
		combinedData.data.limit += typeof result.limit === 'number' ? result.limit : 0;

		if (
			result.data &&
			typeof result.data === 'object' &&
			'items' in result.data &&
			Array.isArray((result.data as IDataObject).items)
		) {
			combinedData.data.items = [
				...combinedData.data.items,
				...(result.data.items as IDataObject[]),
			];
		}
	}

	return combinedData;
}

export function isUsedAsAiTool(nodeType: string): boolean {
	const parts = nodeType.split('.');
	return parts[parts.length - 1] === `${ClassNameCamel}Tool`;
}

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
			if (['SUCCEEDED', 'FAILED', 'TIMED-OUT', 'ABORTED'].includes(status)) {
				break;
			}
		} catch (err) {
			throw new NodeApiError(this.getNode(), {
				message: `Error polling run status: ${err}`,
			});
		}
		await sleep(1000);
	}
	return lastRunData;
}

export async function getResults(this: IExecuteFunctions, datasetId: string): Promise<any> {
	let results = await apiRequest.call(this, {
		method: 'GET',
		uri: `/v2/datasets/${datasetId}/items`,
	});

	// If used as a tool from an AI Agent, only return markdown results
	// This reduces the token amount more than half
	if (isUsedAsAiTool(this.getNode().type)) {
		results = results.map((item: any) => ({ markdown: item.markdown }));
	}

	return this.helpers.returnJsonArray(results);
}
