import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';

export function buildActorInput(
	context: IExecuteFunctions,
	itemIndex: number,
	defaultInput: Record<string, any>,
): Record<string, any> {
	return {
		...defaultInput,
		categoryUrls: context.getNodeParameter('categoryUrls', itemIndex),
	};
}

const authenticationProperties: INodeProperties[] = [
	{
		displayName: 'Authentication',
		name: 'authentication',
		type: 'options',
		options: [
			{
				name: 'API Key',
				value: 'apifyApi',
			},
			{
				name: 'OAuth2',
				value: 'apifyOAuth2Api',
			},
		],
		default: 'apifyApi',
		description: 'Choose which authentication method to use',
	},
];

export const actorProperties: INodeProperties[] = [
	{
		displayName: 'Urls',
		name: 'categoryUrls',
		description: 'Enter URLs. You can also use specific product URLs directly.',
		required: true,
		default: {},
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		options: [
			{
				name: 'items',
				displayName: 'Items',
				values: [
					{
						displayName: 'Item',
						name: 'url',
						type: 'string',
						default: '',
					},
				],
			},
		],
		displayOptions: {
			show: {
				operation: ['Run'],
			},
		},
	},
];


export const properties: INodeProperties[] = [...actorProperties, ...authenticationProperties];
