import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { URL } from 'url';
import sharp from 'sharp';

export interface DownloadResult {
	success: boolean;
	format: 'png' | 'jpg' | 'svg' | 'fallback';
	message: string;
}

/**
 * Downloads an icon from a URL and saves it to the specified directory
 * @param iconUrl - URL of the icon to download
 * @param targetDir - Directory where icon should be saved
 * @param filename - Base filename (without extension)
 * @returns Download result with success status and format
 */
export async function downloadActorIcon(
	iconUrl: string,
	targetDir: string,
	filename: string = 'icon',
): Promise<DownloadResult> {
	// Validate inputs
	if (!iconUrl) {
		return {
			success: false,
			format: 'fallback',
			message: 'No icon URL provided - using default Apify icons',
		};
	}

	// Ensure target directory exists
	if (!fs.existsSync(targetDir)) {
		fs.mkdirSync(targetDir, { recursive: true });
	}

	try {
		// Parse URL to determine protocol
		const parsedUrl = new URL(iconUrl);
		const protocol = parsedUrl.protocol === 'https:' ? https : http;

		// Detect file extension from URL
		const urlExtension = path.extname(parsedUrl.pathname).toLowerCase();
		const extension = urlExtension || '.png'; // Default to PNG
		const targetPath = path.join(targetDir, `${filename}${extension}`);

		// Download the icon
		await downloadFile(protocol, iconUrl, targetPath);

		// Verify file was downloaded and has content
		const stats = fs.statSync(targetPath);
		if (stats.size === 0) {
			fs.unlinkSync(targetPath);
			throw new Error('Downloaded file is empty');
		}

		console.log(`✅ Downloaded Actor icon: ${targetPath}`);

		// Determine format (SVG or raster image that needs resizing)
		let format: 'png' | 'jpg' | 'svg' | 'fallback';
		if (extension === '.svg') {
			format = 'svg';
		} else if (extension === '.jpg' || extension === '.jpeg') {
			format = 'jpg';
		} else {
			format = 'png'; // Default to PNG for .png or unknown extensions
		}

		return {
			success: true,
			format,
			message: `Successfully downloaded ${extension} icon`,
		};
	} catch (error: any) {
		console.warn(`⚠️ Failed to download icon: ${error.message}`);
		return {
			success: false,
			format: 'fallback',
			message: `Download failed: ${error.message} - using default Apify icons`,
		};
	}
}

/**
 * Downloads a file from URL to target path using Node.js built-in modules
 */
function downloadFile(
	protocol: typeof https | typeof http,
	url: string,
	targetPath: string,
): Promise<void> {
	return new Promise((resolve, reject) => {
		const file = fs.createWriteStream(targetPath);

		const request = protocol.get(url, (response) => {
			// Handle redirects
			if (response.statusCode === 301 || response.statusCode === 302) {
				const redirectUrl = response.headers.location;
				if (redirectUrl) {
					file.close();
					fs.unlinkSync(targetPath);
					// Recursively follow redirect
					const redirectProtocol = redirectUrl.startsWith('https') ? https : http;
					downloadFile(redirectProtocol, redirectUrl, targetPath)
						.then(resolve)
						.catch(reject);
					return;
				}
			}

			// Check for successful response
			if (response.statusCode !== 200) {
				file.close();
				fs.unlinkSync(targetPath);
				reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
				return;
			}

			// Pipe response to file
			response.pipe(file);

			file.on('finish', () => {
				file.close();
				resolve();
			});

			file.on('error', (err) => {
				file.close();
				fs.unlinkSync(targetPath);
				reject(err);
			});
		});

		request.on('error', (err) => {
			file.close();
			if (fs.existsSync(targetPath)) {
				fs.unlinkSync(targetPath);
			}
			reject(err);
		});

		// Set timeout
		request.setTimeout(30000, () => {
			request.destroy();
			file.close();
			if (fs.existsSync(targetPath)) {
				fs.unlinkSync(targetPath);
			}
			reject(new Error('Download timeout after 30 seconds'));
		});
	});
}

/**
 * Resizes a raster image (PNG/JPEG) from 512x512px to 60x60px using sharp
 * sharp supports multiple input formats (PNG, JPEG, WebP, AVIF, TIFF, GIF, etc.)
 * @param sourcePath - Path to the source image file
 * @param targetPath - Path where the resized image should be saved (will be PNG)
 * @returns true if resize succeeded, false otherwise
 */
export async function resizeRasterIcon(sourcePath: string, targetPath: string): Promise<boolean> {
	try {
		if (!fs.existsSync(sourcePath)) {
			console.warn(`⚠️ Source file does not exist: ${sourcePath}`);
			return false;
		}

		console.log(`🔄 Resizing icon from 512x512px to 60x60px using sharp...`);

		// Use sharp to resize the image
		await sharp(sourcePath)
			.resize(60, 60, {
				kernel: sharp.kernel.lanczos3,
				fit: 'cover',
			})
			.png()
			.toFile(targetPath);

		if (!fs.existsSync(targetPath)) {
			throw new Error('sharp did not produce output file');
		}

		// Verify the output file has content
		const stats = fs.statSync(targetPath);
		if (stats.size === 0) {
			fs.unlinkSync(targetPath);
			throw new Error('Resized file is empty');
		}

		console.log(`✅ Resized icon to 60x60px: ${targetPath}`);
		return true;
	} catch (error: any) {
		console.warn(`⚠️ Failed to resize raster icon: ${error.message}`);

		// Clean up target file on error
		if (fs.existsSync(targetPath)) {
			fs.unlinkSync(targetPath);
		}

		return false;
	}
}
