import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

/**
 * Get Actor ID from package.json
 */
export function getActorIdFromPackageJson(): string | null {
    try {
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

        if (packageJson.apify?.actorId) {
            return packageJson.apify.actorId;
        }

        return null;
    } catch (err) {
        console.error(chalk.red('❌ Failed to read package.json:'), err);
        return null;
    }
}

/**
 * Get the actual node directory name from package.json
 * After init-actor-app runs, ApifyActorTemplate is renamed to the actual Actor name
 * This function reads the node folder name stored in apify.nodeFolderName
 *
 * @returns The node directory name (e.g., "ApifyWebsiteContentCrawler") or null if not found
 */
export function getNodeDirNameFromPackageJson(): string | null {
    try {
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

        // Get the node folder name from apify.nodeFolderName
        // This is set by init-actor-app during initialization
        if (packageJson.apify?.nodeFolderName) {
            return packageJson.apify.nodeFolderName;
        }

        return null;
    } catch (err) {
        console.error(chalk.red('❌ Failed to read package.json:'), err);
        return null;
    }
}
