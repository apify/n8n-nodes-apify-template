// @ts-nocheck
import chalk from 'chalk';
import { type ApifyInputField, type ApifyInputSchema } from '../types.ts';
import type { INodeProperties } from 'n8n-workflow';
import type { Actor, ApifyClient } from 'apify-client';


export async function createActorAppSchemaForN8n(client: ApifyClient, actor: Actor) {
	console.log(`🚀 Creating n8n node for ${chalk.blueBright.bold(actor.title)}`);

	// Get default build
	const defaultBuild = actor.defaultRunOptions.build || 'latest';
	if (!actor.taggedBuilds || !actor.taggedBuilds[defaultBuild]) {
		throw new Error(`Build tag ${defaultBuild} not found`);
	}
	const { buildId } = actor.taggedBuilds[defaultBuild];
	if (!buildId) {
		throw new Error(`Build tag ${defaultBuild} does not have build ID`);
	}
	const build = await client.build(buildId).get();
	if (!build) {
		throw new Error(`Build with ID ${buildId} not found`);
	}
	console.log(`${chalk.green('✔')} Found default build ${chalk.greenBright(buildId)}`);

	// Get input schema
	if (!build.actorDefinition || !build.actorDefinition.input) {
		throw new Error('Build does not have actor definition or input schema');
	}
	const inputSchema = build.actorDefinition.input as ApifyInputSchema;
	console.log(`${chalk.green('✔')} Found input schema for the Actor`);

	// Convert input schema into n8n fields
	const n8nFields = convertApifyToN8n(inputSchema);
	console.log(`${chalk.green('✔')} Converted input schema to n8n node properties`);

	return n8nFields as INodeProperties[];
}

export function convertApifyToN8n(apifySchema: ApifyInputSchema): INodeProperties[] {
    const n8nParameters: INodeProperties[] = [];
    const requiredFields = apifySchema.required || [];

    for (const [key, field] of Object.entries(apifySchema.properties || {})) {
        const typeProps = getPropsForTypeN8n(field);

        const n8nField: INodeProperties = {
            displayName: field.title || key,
            name: key,
            description: field.description || '',
            required: requiredFields.includes(key),
            // prefer explicit default from schema, else prefill, else ''
            default: typeProps.type === 'json'
                ? (field.default ? JSON.stringify(field.default) : field.prefill ?? '')
                : field.default ?? field.prefill ?? '',
            ...typeProps,
        };

        n8nParameters.push(n8nField);
    }

    return n8nParameters;
}

function getPropsForTypeN8n(field: ApifyInputField): Partial<INodeProperties> & { type: INodeProperties['type'] } {
    switch (field.type) {
        case 'string':
            if (field.editor === 'textarea' || field.editor === 'javascript' || field.editor === 'python') {
                return { type: 'string', typeOptions: { rows: 5 } };
            }
            if (field.editor === 'select' || (field?.enum && Array.isArray(field?.enum))) {
                const options: { name: string; value: string }[] = [];
                field?.enum?.forEach((value, index) => {
                    options.push({
                        name: field.enumTitles?.[index] || value,
                        value,
                    });
                });
                return { type: 'options', options };
            }
            if (field.editor === 'datepicker') {
                return { type: 'dateTime' };
            }
            return { type: 'string' };

        case 'integer':
            return {
                type: 'number',
                default: field.default ?? 0,
                typeOptions: {
                    ...(field.minimum !== undefined ? { minValue: field.minimum } : {}),
                    ...(field.maximum !== undefined ? { maxValue: field.maximum } : {}),
                },
            };

        case 'boolean':
            return {
                type: 'boolean',
                default: field.default ?? false,
            };

        case 'array':
            if (field.editor === 'json') {
                return { type: 'json' };
            }
            if (field.editor === 'requestListSources') {
                return {
                    type: 'fixedCollection',
                    typeOptions: { multipleValues: true },
                    default: {},
                    options: [
                        {
                            name: 'items',
                            displayName: 'items',
                            values: [
                                {
                                    displayName: 'item',
                                    name: 'url',
                                    type: 'string',
                                    default: '',
                                },
                            ],
                        },
                    ],
                };
            }
            if (field.editor === 'stringList') {
                return {
                    type: 'fixedCollection',
                    default: {},
                    typeOptions: { multipleValues: true },
                    options: [
                        {
                            name: 'values',
                            displayName: 'Values',
                            values: [
                                {
                                    displayName: 'Value',
                                    name: 'value',
                                    type: 'string',
                                    default: '',
                                },
                            ],
                        },
                    ],
                };
            }
            if (field.editor === 'select') {
                const options: { name: string; value: string }[] = [];
                field?.items?.enum?.forEach((value, index) => {
                    options.push({
                        name: field.items?.enumTitles?.[index] || value,
                        value,
                    });
                });
                return {
                    type: 'multiOptions',
                    options,
                    default: [],
                };
            }
            if (field.editor === 'keyValue') {
                return {
                    type: 'fixedCollection',
                    default: {},
                    typeOptions: { multipleValues: true },
                    options: [
                        {
                            name: 'pairs',
                            displayName: 'Key-Value Pairs',
                            values: [
                                {
                                    displayName: 'Key',
                                    name: 'key',
                                    type: 'string',
                                    default: '',
                                },
                                {
                                    displayName: 'Value',
                                    name: 'value',
                                    type: 'string',
                                    default: '',
                                },
                            ],
                        },
                    ],
                };
            }
            return { type: 'json' };

        case 'object':
            if (field.editor === 'json' || field.editor === 'proxy') {
                return { type: 'json' };
            }
            return { type: 'json' };

        default:
            console.log(chalk.yellow('⚠️ Warning: ') + chalk.redBright(`Unsupported type: ${field.type}`));
            return { type: 'string' };
    }
}

