 

import { INodeProperties } from 'n8n-workflow';

import * as actors from './actors';

const authenticationProperties: INodeProperties[] = [];

const properties: INodeProperties[] = [...authenticationProperties, ...actors.properties];

const methods = {};

export { properties, methods };
