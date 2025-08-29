const path = require('path');

module.exports = {
	packageName: 'n8n-nodes-apify-actor-template',
	credentials: {
		ApifyApi: {
			displayName: 'Apify API key connection',
			name: 'apifyApi',
			className: 'ApifyApi',
			scheme: 'apiKey',
		},
		ApifyOAuth2Api: {
			displayName: 'Apify OAuth2 connection',
			name: 'apifyOAuth2Api',
			className: 'ApifyOAuth2Api',
			scheme: 'oauth2',
		},
	},
	nodes: {
		Apify: {
			displayName: 'Apify',
			name: 'Apify',
			description: 'Apify API',
			api: path.resolve(__dirname, 'openapi.yaml'),
			icon: './icons/apify.svg',
			tags: [
				'Actors/Actor collection',
				'Actors/Actor object',
				'Actors/Run collection',
				'Actors/Run actor synchronously',
				'Actors/Run Actor synchronously and get dataset items',
				// 'Actors/Run object',
				// 'Actors/Abort run',
				// 'Actors/Metamorph run',
				// 'Actors/Resurrect run',
				'Actors/Last run object and its storages',

				'Actor tasks/Task collection',
				'Actor tasks/Task object',
				'Actor tasks/Task input object',
				'Actor tasks/Run collection',
				'Actor tasks/Run task synchronously',
				'Actor tasks/Run task synchronously and get dataset items',
				'Actor tasks/Last run object and its storages',

				'Actor runs/Run collection',
				'Actor runs/Run object and its storages',
				// "Actor runs/Delete run",
				// "Actor runs/Abort run",
				// "Actor runs/Metamorph run",
				// "Actor runs/Reboot run",
				// "Actor runs/Resurrect run",
				// "Actor runs/Update status message",

				'Datasets',
				'Datasets/Dataset collection',
				'Datasets/Dataset',
				'Datasets/Item collection',
			],
			// operations: ['/v2/acts/{actorId}/run-sync'],
			tagsExclude: [],
			baseUrl: 'https://api.apify.com',
			credentials: [
				{
					displayName: 'Apify API key connection',
					name: 'apifyApi',
					required: false,
					show: {
						authentication: ['apiKey'],
					},
				},
				{
					displayName: 'Apify OAuth2 connection',
					name: 'apifyOAuth2Api',
					required: false,
					show: {
						authentication: ['oauth2'],
					},
				},
			],
		},
	},
	overwrites: {
		operations: [
			{
				match: {
					name: 'resource',
				},
				set: function (operation) {
					operation.options = operation.options.map((option) => {
						return {
							...option,
							description: '',
						};
					});
					return operation;
				},
			},
			{
				match: {
					name: 'offset',
				},
				set: {
					default: 0,
				},
			},
		],
	},
	operationNameFn: (name) => {
		// split by /
		// const parts = name.split('/');
		// return parts[1];
		return name;
	},
	resourceNameFn: (name, opName) => {
		// split by /
		const parts = name.split('/');
		return parts[0];
	},
	actionNameFn: (name, opName) => {
		// split by /
		// const parts = name.split('/');
		return opName;
	},
};
