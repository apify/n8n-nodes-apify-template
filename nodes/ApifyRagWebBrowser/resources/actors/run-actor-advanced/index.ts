import { INodePropertyOptions } from 'n8n-workflow';

import { properties } from './properties';

export const name = 'Run Actor Advanced';

const option: INodePropertyOptions = {
	name: 'Advanced Settings',
	value: 'Run Actor Advanced',
	action: 'Crawl a Website (Advanced Settings)',
	description:
		'Use advanced options for crawling including crawling type, crawling depth, and max pages',
};

export { option, properties };
