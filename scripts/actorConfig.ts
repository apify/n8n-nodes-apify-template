import fs from 'fs';

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
 * Replaces $$PLACEHOLDERS in the given node.ts file.
 */
export function setConfig(nodeFilePath: string, values: PlaceholderValues) {
    let nodeFile = fs.readFileSync(nodeFilePath, 'utf-8');

    for (const [key, val] of Object.entries(values)) {
        nodeFile = nodeFile.replace(`$$${key}`, val);
    }

    fs.writeFileSync(nodeFilePath, nodeFile, 'utf-8');
    console.log(`✅ Updated placeholders in ${nodeFilePath}`);
}
