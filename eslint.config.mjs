import { config } from '@n8n/node-cli/eslint';

export default [
	// include base n8n config first
	...config,

	// completely ignore all __tests__ folders
	{
		ignores: [
			'**/__tests__/**', 
			'nodes/ApifyContentCrawler/__tests__/**', 
			'scripts/**'
		],
	},

	// disable any-type rules everywhere
	{
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
];