import fs from 'fs';
import path from 'path';
import type { Actor } from 'apify-client';
import { PACKAGE_NAME_PREFIX, packageNameCheck } from './utils.ts';
import { downloadActorIcon, resizeRasterIcon } from './iconDownloader.ts';

export interface PlaceholderValues {
    PACKAGE_NAME: string;
    CLASS_NAME: string;
    ACTOR_ID: string;
    X_PLATFORM_HEADER_ID: string;
    X_PLATFORM_APP_HEADER_ID: string;
    DISPLAY_NAME: string;
    DESCRIPTION: string;
    ICON_FORMAT: 'png' | 'svg' | 'fallback';
}

/**
 * Downloads actor icon and sets up icon files in the template directory
 * @param actor - Actor object from Apify API
 * @param targetDir - Target directory for the node (e.g., nodes/ApifyActorTemplate)
 * @returns Icon format ('png', 'svg', or 'fallback')
 */
async function setupActorIcon(
	actor: Actor,
	targetDir: string,
): Promise<'png' | 'svg' | 'fallback'> {
	// Check if actor has pictureUrl
	const pictureUrl = (actor as any).pictureUrl;

	if (!pictureUrl) {
		console.log('ℹ️  Actor does not have a custom icon - using default Apify icons');
		return 'fallback';
	}

	console.log(`🎨 Downloading actor icon from: ${pictureUrl}`);

	// Download the icon
	const result = await downloadActorIcon(pictureUrl, targetDir, 'actorIcon');

	if (!result.success) {
		console.log(result.message);
		return 'fallback';
	}

	// If PNG or JPEG was downloaded, resize it to 60x60px
	if (result.format === 'png' || result.format === 'jpg') {
		const extension = result.format === 'jpg' ? '.jpg' : '.png';
		const sourcePath = path.join(targetDir, `actorIcon${extension}`);
		const resizedPath = path.join(targetDir, 'actorIcon-resized.png');

		const resizeSuccess = resizeRasterIcon(sourcePath, resizedPath);

		if (!resizeSuccess) {
			// Resize failed, clean up and fall back
			if (fs.existsSync(sourcePath)) fs.unlinkSync(sourcePath);
			if (fs.existsSync(resizedPath)) fs.unlinkSync(resizedPath);
			console.log('⚠️  Image resize failed - using default Apify icons');
			return 'fallback';
		}

		// Copy resized PNG to both light and dark modes
		const lightPath = path.join(targetDir, 'icon.png');
		const darkPath = path.join(targetDir, 'iconDark.png');

		fs.copyFileSync(resizedPath, lightPath);
		fs.copyFileSync(resizedPath, darkPath);

		// Remove temporary files
		fs.unlinkSync(sourcePath);
		fs.unlinkSync(resizedPath);

		console.log('✅ Created icon.png and iconDark.png (same PNG for both modes)');
		return 'png';
	}

	// If SVG was downloaded, use it for both modes
	if (result.format === 'svg') {
		const sourcePath = path.join(targetDir, 'actorIcon.svg');
		const lightPath = path.join(targetDir, 'icon.svg');
		const darkPath = path.join(targetDir, 'iconDark.svg');

		fs.copyFileSync(sourcePath, lightPath);
		fs.copyFileSync(sourcePath, darkPath);
		fs.unlinkSync(sourcePath);

		console.log('✅ Created icon.svg and iconDark.svg (same SVG for both modes)');
		return 'svg';
	}

	return 'fallback';
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
        PACKAGE_NAME: `${PACKAGE_NAME_PREFIX}-${rawName}`,
        CLASS_NAME: className,
        ACTOR_ID: actor.id,
        X_PLATFORM_HEADER_ID: xPlatformHeaderId,
        X_PLATFORM_APP_HEADER_ID: `${rawName}-app`,
        DISPLAY_NAME: displayName,
        DESCRIPTION: actor.description || '',
        ICON_FORMAT: 'fallback', // Default value
    };

    // Check for package name availability on npm registry
    values.PACKAGE_NAME = await packageNameCheck(values.PACKAGE_NAME);

    // Download actor icon
    const templateDir = path.dirname(nodeFilePath);
    values.ICON_FORMAT = await setupActorIcon(actor, templateDir);

    // Update icon references in node file based on format
    let nodeFile = fs.readFileSync(nodeFilePath, 'utf-8');

    if (values.ICON_FORMAT === 'png') {
        // Replace SVG references with PNG references
        nodeFile = nodeFile.replace(/light: 'file:apify\.svg'/g, "light: 'file:icon.png'");
        nodeFile = nodeFile.replace(/dark: 'file:apifyDark\.svg'/g, "dark: 'file:iconDark.png'");
    } else if (values.ICON_FORMAT === 'svg') {
        // Replace default Apify SVG names with custom icon names
        nodeFile = nodeFile.replace(/light: 'file:apify\.svg'/g, "light: 'file:icon.svg'");
        nodeFile = nodeFile.replace(/dark: 'file:apifyDark\.svg'/g, "dark: 'file:iconDark.svg'");
    }
    // If fallback, keep original apify.svg references (they'll be copied later)

    // Replace other placeholders
    for (const [key, val] of Object.entries(values)) {
        if (key !== 'ICON_FORMAT') { // Don't replace ICON_FORMAT in files
            const regex = new RegExp(`\\$\\$${key}`, 'g');
            nodeFile = nodeFile.replace(regex, val);
        }
    }

    fs.writeFileSync(nodeFilePath, nodeFile, 'utf-8');
    console.log(`✅ Updated placeholders in ${nodeFilePath}`);

    return values;
}
