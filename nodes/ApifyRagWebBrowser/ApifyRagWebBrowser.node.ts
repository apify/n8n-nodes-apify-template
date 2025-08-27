/* eslint-disable n8n-nodes-base/node-class-description-outputs-wrong */
/* eslint-disable n8n-nodes-base/node-class-description-inputs-wrong-regular-node */

import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';
import { properties } from './ApifyRagWebBrowser.properties';
import { methods } from './ApifyRagWebBrowser.methods';
import { actorsRouter } from './resources/actors/router';

export const ACTOR_ID = '3ox4R101TgZz67sLr' as string;

export const PACKAGE_NAME = 'n8n-nodes-apify-rag-web-browser' as string;
export const CLASS_NAME = 'ApifyRagWebBrowser' as string;
export const ClassNameCamel = CLASS_NAME.charAt(0).toLowerCase() + CLASS_NAME.slice(1); // make the first letter lowercase for name fields

export const X_PLATFORM_HEADER_ID = 'n8n' as string;
export const X_PLATFORM_APP_HEADER_ID = 'rag-web-browser-app' as string;

export const DISPLAY_NAME = 'Apify Rag Web Browser' as string;
export const DESCRIPTION = 'Web browser for OpenAI Assistants, RAG pipelines, or AI agents, similar to a web browser in ChatGPT. It queries Google Search, scrapes the top N pages, and returns their content as Markdown for further processing by an LLM. It can also scrape individual URLs. Supports Model Context Protocol (MCP).' as string;

export class ApifyRagWebBrowser implements INodeType {
	description: INodeTypeDescription = {
		displayName: DISPLAY_NAME,
		name: ClassNameCamel,
		icon: 'file:apify.svg',
		group: ['transform'],
		// Mismatched version and defaultVersion as a minor hack to hide "Custom API Call" resource
		version: [1],
		defaultVersion: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: DESCRIPTION,
		defaults: {
			name: DISPLAY_NAME,
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		credentials: [
			{
				displayName: 'Apify API key connection',
				name: 'apifyApi',
				required: false,
				displayOptions: {
					show: {
						authentication: ['apifyApi'],
					},
				},
			},
			{
				displayName: 'Apify OAuth2 connection',
				name: 'apifyOAuth2Api',
				required: false,
				displayOptions: {
					show: {
						authentication: ['apifyOAuth2Api'],
					},
				},
			},
		],

		properties,
	};

	methods = methods;

	async execute(this: IExecuteFunctions) {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const data = await actorsRouter.call(this, i);
			// `data` may be an array of items or a single item, so we either push the spreaded array or the single item
			if (Array.isArray(data)) {
				returnData.push(...data);
			} else {
				returnData.push(data);
			}
		}

		return [returnData];
	}
}
