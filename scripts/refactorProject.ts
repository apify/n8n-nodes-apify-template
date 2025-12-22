import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Handles icon files after renaming:
 * - If custom icon was downloaded (PNG/SVG), remove default Apify icons
 * - If fallback, keep default Apify icons but don't rename them
 */
function handleIconFiles(nodeDir: string, iconFormat: 'png' | 'svg' | 'fallback'): void {
	const defaultSvgLight = path.join(nodeDir, 'apify.svg');
	const defaultSvgDark = path.join(nodeDir, 'apifyDark.svg');

	if (iconFormat === 'png' || iconFormat === 'svg') {
		// Custom icon was downloaded - remove default Apify icons if they exist
		if (fs.existsSync(defaultSvgLight)) {
			fs.unlinkSync(defaultSvgLight);
			console.log('🗑️  Removed default apify.svg (using custom icon)');
		}
		if (fs.existsSync(defaultSvgDark)) {
			fs.unlinkSync(defaultSvgDark);
			console.log('🗑️  Removed default apifyDark.svg (using custom icon)');
		}
	} else {
		// Fallback - default icons should already be in place
		console.log('ℹ️  Using default Apify icons (apify.svg and apifyDark.svg)');
	}
}

export function refactorProject(
	oldClass: string,
	newClass: string,
	oldPackage: string,
	newPackage: string,
	iconFormat: 'png' | 'svg' | 'fallback' = 'fallback',
) {
	// Rename folders and files
	const oldDir = path.join("nodes", oldClass);
	const newDir = path.join("nodes", newClass);

	if (fs.existsSync(oldDir)) {
		// List files before rename for debugging
		const filesBeforeRename = fs.readdirSync(oldDir);
		console.log(`📁 Files in ${oldDir} before rename:`, filesBeforeRename.filter(f => f.includes('icon') || f.includes('apify')));

		if (!fs.existsSync(newDir)) {
			try {
				execSync(`git mv "${oldDir}" "${newDir}"`);
			} catch {
				fs.renameSync(oldDir, newDir);
			}
			console.log(`✅ Renamed folder: nodes/${oldClass} -> nodes/${newClass}`);

			// List files after rename for debugging
			const filesAfterRename = fs.readdirSync(newDir);
			console.log(`📁 Files in ${newDir} after rename:`, filesAfterRename.filter(f => f.includes('icon') || f.includes('apify')));
		}

		const exts = ["methods.ts", "node.json", "node.ts", "properties.ts"];
		for (const ext of exts) {
			const oldFile = path.join(newDir, `${oldClass}.${ext}`);
			const newFile = path.join(newDir, `${newClass}.${ext}`);
			if (fs.existsSync(oldFile)) {
				try {
					execSync(`git mv "${oldFile}" "${newFile}"`);
				} catch {
					fs.renameSync(oldFile, newFile);
				}
				console.log(`Renamed: ${oldFile} -> ${newFile}`);
			}
		}
		console.log(`✅ Renamed files inside nodes/${newClass}`);

		// Handle icon files based on format
		handleIconFiles(newDir, iconFormat);
	} else {
		console.log(`⚠️ Warning: ${oldDir} not found (skipped).`);
	}

	// Bulk replace in all files (excluding scripts folder)
	const walk = (dir: string): string[] => {
		let results: string[] = [];
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);

		if (
			fullPath.includes("node_modules") ||
			fullPath.includes("dist") ||
			fullPath.includes("docs") ||
			fullPath.includes("credentials") ||
			fullPath.includes(".git") ||
			fullPath.startsWith("scripts")
		) {
			continue;
		}

		if (entry.isDirectory()) {
			results = results.concat(walk(fullPath));
		} else {
			results.push(fullPath);
		}
		}
		return results;
	};

	const files = walk(".");

	for (const file of files) {
		try {
		const content = fs.readFileSync(file, "utf8");
		const updated = content
			.replace(new RegExp(oldClass, "g"), newClass)
			.replace(new RegExp(oldPackage, "g"), newPackage);

		if (updated !== content) {
			fs.writeFileSync(file, updated, "utf8");
			console.log(`Edited: ${file}`);
		}
		} catch {
		// skip binary/unreadable files
		}
	}
}
