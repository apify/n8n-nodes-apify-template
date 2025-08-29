/* eslint-disable n8n-nodes-base/node-param-options-type-unsorted-items */

import { INodeProperties } from 'n8n-workflow';

import * as actors from './actors';

const authenticationProperties: INodeProperties[] = [];

const properties: INodeProperties[] = [...authenticationProperties, ...actors.properties];

const methods = {};

export { properties, methods };
