import fs from 'fs';
import path from 'path';
import type { Actor } from 'apify-client';
import { PACKAGE_NAME_PREFIX, packageNameCheck } from './utils';
import { downloadActorIcon, resizeRasterIcon } from './iconDownloader';

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
 * Downloads Actor icon and sets up icon files in the template directory
 * @param actor - Actor object from Apify API
 * @param targetDir - Target directory for the node (e.g., nodes/ApifyActorTemplate)
 * @returns Icon format ('png', 'svg', or 'fallback')
 */
async function setupActorIcon(
	actor: Actor,
	targetDir: string,
): Promise<'png' | 'svg' | 'fallback'> {
	// Check if Actor has pictureUrl
	const pictureUrl = (actor as any).pictureUrl;

	if (!pictureUrl) {
		console.log('ℹ️  Actor does not have a custom icon - using default Apify icons');
		return 'fallback';
	}

	console.log(`🎨 Downloading Actor icon from: ${pictureUrl}`);

	// Download the icon
	const result = await downloadActorIcon(pictureUrl, targetDir, 'actorIcon');

	if (!result.success) {
		console.log(result.message);
		return 'fallback';
	}

	// If PNG or JPEG was downloaded, resize it to 60x60px
	// Note: n8n only supports PNG and SVG. JPEG will be converted to PNG during resize.
	if (result.format === 'png' || result.format === 'jpg') {
		const extension = result.format === 'jpg' ? '.jpg' : '.png';
		const sourcePath = path.join(targetDir, `actorIcon${extension}`);
		const logoPath = path.join(targetDir, 'logo.png'); // Always output as PNG with logo.png name

		console.log(result.format === 'jpg' ? '🔄 Converting JPEG to PNG and resizing...' : '🔄 Resizing PNG...');
		const resizeSuccess = await resizeRasterIcon(sourcePath, logoPath);

		if (!resizeSuccess) {
			// Resize failed, clean up and fall back
			if (fs.existsSync(sourcePath)) fs.unlinkSync(sourcePath);
			if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
			console.log('⚠️  Image resize failed - using default Apify icons');
			return 'fallback';
		}

		// Remove temporary source file
		fs.unlinkSync(sourcePath);

		// Remove the default logo.svg since we now have logo.png
		const defaultLogoSvg = path.join(targetDir, 'logo.svg');
		if (fs.existsSync(defaultLogoSvg)) {
			fs.unlinkSync(defaultLogoSvg);
			console.log('🗑️  Removed default logo.svg (using logo.png)');
		}

		console.log('✅ Created logo.png');
		return 'png';
	}

	// If SVG was downloaded, rename it to logo.svg
	if (result.format === 'svg') {
		const sourcePath = path.join(targetDir, 'actorIcon.svg');
		const logoPath = path.join(targetDir, 'logo.svg');

		fs.copyFileSync(sourcePath, logoPath);
		fs.unlinkSync(sourcePath);

		console.log('✅ Created logo.svg');
		return 'svg';
	}

	return 'fallback';
}

/**
 * Uses an existing ApifyClient to fetch Actor info,
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

    // Download Actor icon
    const templateDir = path.dirname(nodeFilePath);
    values.ICON_FORMAT = await setupActorIcon(actor, templateDir);

    // Update icon references in node file based on format
    let nodeFile = fs.readFileSync(nodeFilePath, 'utf-8');

    if (values.ICON_FORMAT === 'png') {
        // Replace logo.svg reference with logo.png
        nodeFile = nodeFile.replace(/icon:\s*'file:logo\.svg'/g, "icon: 'file:logo.png'");
    }

    // Replace other placeholders
    for (const [key, val] of Object.entries(values)) {
        if (key !== 'ICON_FORMAT') { // Don't replace ICON_FORMAT in files
            const regex = new RegExp(`\\$\\$${key}`, 'g');
            nodeFile = nodeFile.replace(regex, val);
        }
    }

    fs.writeFileSync(nodeFilePath, nodeFile, 'utf-8');
    console.log(`✅ Updated placeholders in ${nodeFilePath}`);

    // Update credential files icon references
    const credentialFiles = [
        path.join('credentials', 'ApifyApi.credentials.ts'),
        path.join('credentials', 'ApifyOAuth2Api.credentials.ts'),
    ];

    for (const credFile of credentialFiles) {
        if (fs.existsSync(credFile)) {
            let credContent = fs.readFileSync(credFile, 'utf-8');

            if (values.ICON_FORMAT === 'png') {
                // Replace logo.svg with logo.png in credentials
                credContent = credContent.replace(/logo\.svg/g, 'logo.png');
            }
            // If svg or fallback, keep logo.svg (no change needed)

            fs.writeFileSync(credFile, credContent, 'utf-8');
            console.log(`✅ Updated icon reference in ${credFile}`);
        }
    }

    return values;
}
