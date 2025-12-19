#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

/**
 * Restores the original helper files from backups
 */
async function restoreBackups(): Promise<void> {
	const backupDir = path.join(process.cwd(), '.backups');

	if (!fs.existsSync(backupDir)) {
		console.log('⚠️  No backups found. Skipping restore.');
		return;
	}

	// Find all helper files
	const helperFiles = await glob('nodes/*/helpers/{inputFunctions,propertyFunctions}.ts', {
		cwd: process.cwd(),
		absolute: true,
	});

	let restoredCount = 0;

	for (const filePath of helperFiles) {
		const fileName = path.basename(filePath);
		const backupPath = path.join(backupDir, fileName);

		if (fs.existsSync(backupPath)) {
			fs.copyFileSync(backupPath, filePath);
			restoredCount++;
		}
	}

	console.log(`✅ Restored ${restoredCount} files from backups`);

	// Clean up backup directory
	fs.rmSync(backupDir, { recursive: true, force: true });
	console.log('🧹 Cleaned up backup directory\n');
}

/**
 * Main post-build function
 */
async function postBuild(): Promise<void> {
	console.log('\n🔄 Starting post-build restoration...\n');

	try {
		await restoreBackups();
		console.log('✨ Post-build restoration complete!\n');
	} catch (error) {
		console.error('❌ Post-build failed:', error);
		process.exit(1);
	}
}

// Run the post-build script
postBuild();
