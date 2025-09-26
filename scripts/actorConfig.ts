import fs from 'fs';
import type { Actor } from 'apify-client';

export interface PlaceholderValues {
    PACKAGE_NAME: string;
    CLASS_NAME: string;
    ACTOR_ID: string;
    X_PLATFORM_HEADER_ID: string;
    X_PLATFORM_APP_HEADER_ID: string;
    DISPLAY_NAME: string;
    DESCRIPTION: string;
}

/**
 * Uses an existing ApifyClient to fetch actor info,
 * generates placeholder values, replaces them in the node file,
 * and returns the values.
 */
export async function setConfig(
    actor: Actor,
    nodeFilePath: string,
    xPlatformHeaderId: string,
): Promise<PlaceholderValues> {

    const rawName = actor.name;
    const rawNameProcessed = rawName
        .split('-')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    const className = 'Apify' + rawName
        .split('-')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('');
    const displayName = 'Apify ' + `${actor.title ? actor.title : rawNameProcessed}`

    const values: PlaceholderValues = {
        PACKAGE_NAME: `n8n-nodes-apify-${rawName}`,
        CLASS_NAME: className,
        ACTOR_ID: actor.id,
        X_PLATFORM_HEADER_ID: xPlatformHeaderId,
        X_PLATFORM_APP_HEADER_ID: `${rawName}-app`,
        DISPLAY_NAME: displayName,
        DESCRIPTION: actor.description || '',
    };

    // Replace placeholders in node file
    let nodeFile = fs.readFileSync(nodeFilePath, 'utf-8');
    for (const [key, val] of Object.entries(values)) {
        const regex = new RegExp(`\\$\\$${key}`, 'g');
        nodeFile = nodeFile.replace(regex, val);
    }
    fs.writeFileSync(nodeFilePath, nodeFile, 'utf-8');
    console.log(`✅ Updated placeholders in ${nodeFilePath}`);

    return values;
}
