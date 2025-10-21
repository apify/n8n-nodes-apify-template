import type { Icon, ICredentialType, INodeProperties } from 'n8n-workflow';

const scopes = ['profile', 'full_api_access'];

export class ApifyOAuth2Api implements ICredentialType {
	name = 'apifyOAuth2Api';

	extends = ['oAuth2Api'];

	displayName = 'Apify OAuth2 API';

	icon: Icon = {
		dark: 'file:../nodes/ApifyActorTemplate/apifyDark.svg',
		light: 'file:../nodes/ApifyActorTemplate/apify.svg'
	}

	// TODO: documentation URL for Apify OAuth2 API missing
	documentationUrl = 'https://docs.apify.com/api/v2';

	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'pkce',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: 'https://console.apify.com/authorize/oauth',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://console-backend.apify.com/oauth/apps/token',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: `${scopes.join(' ')}`,
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'header',
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'hidden',
			default: '',
			typeOptions: { password: true },
		},
	];
}
