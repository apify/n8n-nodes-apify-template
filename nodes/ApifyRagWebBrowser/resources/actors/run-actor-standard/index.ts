import { INodePropertyOptions } from 'n8n-workflow';

import { properties } from './properties';

export const name = 'Run Actor Standard';

const option: INodePropertyOptions = {
	name: 'Standard Settings',
	value: 'Run Actor Standard',
	action: 'Crawl a Website (Standard Settings)',
	description: 'Crawl any website with our standard settings',
};

export { option, properties };
