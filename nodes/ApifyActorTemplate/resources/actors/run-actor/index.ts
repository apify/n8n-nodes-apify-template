import { INodePropertyOptions } from 'n8n-workflow';

import { properties } from './properties';

export const name = 'Run';

const option: INodePropertyOptions = {
	name: 'Run',
	value: 'Run',
};

export { option, properties };
