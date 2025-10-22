import type { IAuthenticateGeneric, Icon, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class ApifyApi implements ICredentialType {
	name = 'apifyApi';

	displayName = 'Apify API';

	documentationUrl = 'https://docs.apify.com/platform/integrations/api#api-token';

	icon: Icon = {
		dark: 'file:../nodes/ApifyActorTemplate/apifyDark.svg',
		light: 'file:../nodes/ApifyActorTemplate/apify.svg'
	}

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

		/**
	 * Simple credential test to verify Apify API key
	 */
	test: ICredentialTestRequest = {
		request: {
			method: 'GET',
			url: 'https://api.apify.com/v2/me',
		},
	};
}
