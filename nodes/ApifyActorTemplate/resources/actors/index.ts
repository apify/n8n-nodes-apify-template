import { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { runHooks } from './hooks';

import * as runActorStandard from './run-actor-standard';
import * as runActorAdvanced from './run-actor-advanced';

const operations: INodePropertyOptions[] = [runActorStandard.option, runActorAdvanced.option];

export const name = 'Actors';

const operationSelect: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	default: '',
};

// overwrite the options of the operationSelect
operationSelect.options = operations;

// set the default operation
operationSelect.default = operations.length > 0 ? operations[0].value : '';

export const rawProperties: INodeProperties[] = [
	operationSelect,
	...runActorStandard.properties,
	...runActorAdvanced.properties,
];

const { properties, methods } = runHooks(rawProperties);

export { properties, methods };
