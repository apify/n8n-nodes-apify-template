import chalk from 'chalk';
import { ApifyClient } from 'apify-client';
import { convertApifyToN8n } from './actorSchemaConverter.ts';
import { type ApifyInputSchema } from './types.ts';
import type { INodeProperties } from 'n8n-workflow';


const apifyClient = new ApifyClient();

export async function createActorAppForN8n(actorId: string) {
	// Get Actor
	const actor = await apifyClient.actor(actorId).get();
	if (!actor) {
		throw new Error(`Actor with ID ${actorId} not found`);
	}
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
	const build = await apifyClient.build(buildId).get();
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
