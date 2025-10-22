import { INodePropertyOptions } from 'n8n-workflow';

import { properties } from './properties';
import { DESCRIPTION } from '../../../ApifyActorTemplate.node';

export const name = 'Run Actor';

// TODO 2: Check that the options below are appropriate
const option: INodePropertyOptions = {
	name: 'Run Scraper',
	value: 'Run Actor',
	action: 'Scrape a website',
	description: DESCRIPTION,
};

export { option, properties };
