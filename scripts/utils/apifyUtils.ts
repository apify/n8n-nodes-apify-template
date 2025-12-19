import { ApifyClient, type Actor } from 'apify-client';
import type { ApifyInputSchema } from './types';
import { PACKAGE_NAME_PREFIX, packageNameCheck } from './inputPrompts';

export interface PlaceholderValues {
    PACKAGE_NAME: string;
    CLASS_NAME: string;
    ACTOR_ID: string;
    X_PLATFORM_HEADER_ID: string;
    X_PLATFORM_APP_HEADER_ID: string;
    DISPLAY_NAME: string;
    DESCRIPTION: string;
    RESOURCE_NAME: string;
}

/**
 * Fetch Actor input schema from Apify API
 * This is a reusable utility function to avoid duplicating fetch logic
 */
export async function fetchActorInputSchema(actorId: string): Promise<ApifyInputSchema> {
	const client = new ApifyClient();

	// Fetch Actor
	const actor = await client.actor(actorId).get();
	if (!actor) {
		throw new Error(`Actor with ID ${actorId} not found`);
	}

	// Get default build
	const defaultBuild = actor.defaultRunOptions?.build || 'latest';
	const buildId = actor.taggedBuilds?.[defaultBuild]?.buildId;
	if (!buildId) {
		throw new Error(`Build not found for Actor ${actorId}`);
	}

	// Fetch build
	const build = await client.build(buildId).get();
	if (!build?.actorDefinition?.input) {
		throw new Error('No input schema found in build');
	}

	return build.actorDefinition.input as ApifyInputSchema;
}

/**
 * Generate placeholder values from actor
 */
export async function generatePlaceholderValues(actor: Actor, xPlatformHeaderId: string = 'n8n'): Promise<PlaceholderValues> {
	const rawName = actor.name;
	const rawNameProcessed = rawName
		.split('-')
		.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');

	const className = 'Apify' + rawName
		.split('-')
		.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
		.join('');
	const displayName = 'Apify ' + `${actor.title ? actor.title : rawNameProcessed}`;

	const values: PlaceholderValues = {
		PACKAGE_NAME: `${PACKAGE_NAME_PREFIX}-${rawName}`,
		CLASS_NAME: className,
		ACTOR_ID: actor.id,
		X_PLATFORM_HEADER_ID: xPlatformHeaderId,
		X_PLATFORM_APP_HEADER_ID: `${rawName}-app`,
		DISPLAY_NAME: displayName,
		DESCRIPTION: actor.description || '',
		RESOURCE_NAME: actor.title || displayName,
	};

	// Check for package name availability on npm registry
	values.PACKAGE_NAME = await packageNameCheck(values.PACKAGE_NAME);

	return values;
}
