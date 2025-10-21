import { INodeProperties } from 'n8n-workflow';

export const properties: INodeProperties[] = [
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
				operation: ['Run Actor Advanced'],
			},
		},
	},
];
