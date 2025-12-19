import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

export const PACKAGE_NAME_PREFIX = "n8n-nodes-apify"

/**
 * Generic function to ask for user input
 */
export function askForInput(question: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

/**
 * Ask user for Actor ID
 */
export async function askForActorId(): Promise<string> {
    return askForInput('👉 Please enter the ACTOR_ID: ');
}

/**
 * Ask user for operation count with validation
 */
export async function askForOperationCount(defaultValue: number = 1): Promise<number> {
    const answer = await askForInput(`👉 How many operations? (1-10, default ${defaultValue}): `);

    const trimmed = answer.trim();
    if (!trimmed) {
        return defaultValue;
    }

    const count = parseInt(trimmed, 10);
    if (isNaN(count) || count < 1 || count > 10) {
        console.log(`⚠️  Invalid number. Defaulting to ${defaultValue}.`);
        return defaultValue;
    }

    return count;
}

export async function packageNameCheck(initialName: string): Promise<string> {
    let packageName = initialName;

    while (true) {
        // 1. Validate string format
        const isValid = validatePackageName(packageName);
        if (!isValid) {
            console.log(`❌ "${packageName}" is not a valid npm package name.`);
        } else {
            // 2. Check npm registry availability
            const available = await isPackageAvailable(packageName);
            if (available) {
                console.log(`✅ "${packageName}" is available on npm.`);
                return packageName;
            }
            console.log(`❌ "${packageName}" is already taken on npm.`);
        }

        // 3. Ask for another suffix (make prefix clear)
        const userValue = await askForInput(`Choose a new package name suffix (${PACKAGE_NAME_PREFIX}-): `);

        // Handle empty input or CTRL + C
        if (!userValue) {
            console.log('⚠️  Package name is required.');
            continue;
        }

        packageName = `${PACKAGE_NAME_PREFIX}-${userValue}`;

        // Validate the new package name format
        if (!validatePackageName(packageName)) {
            console.log(`❌ "${packageName}" is not a valid npm package name format.`);
            continue;
        }

        console.log(`👉 Trying package name: ${packageName}`);
    }
}


function validatePackageName(name: string): boolean {
    // Basic npm rules: lowercase, no spaces, <= 214 chars
    const valid =
        typeof name === 'string' &&
        name.length > 0 &&
        name.length <= 214 &&
        /^[a-z0-9-_]+$/.test(name);

    return valid;
}

async function isPackageAvailable(name: string): Promise<boolean> {
    try {
        const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`, {
            method: 'GET',
        });
        return res.status === 404; // 404 = not found = available
    } catch (err) {
        console.error(`⚠️ Failed to check availability for "${name}":`, err);
        // Fail-safe: assume not available if error
        return false;
    }
}

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

/**
 * Get all existing operations across all resources
 * Returns a map of resource names to their operation names
 */
export function getExistingOperations(nodeDir: string): Map<string, string[]> {
    const operationsMap = new Map<string, string[]>();

    try {
        const resourcesPath = path.join(nodeDir, 'resources');

        if (!fs.existsSync(resourcesPath)) {
            return operationsMap;
        }

        const resourceEntries = fs.readdirSync(resourcesPath, { withFileTypes: true });

        // Scan each resource directory
        for (const resourceEntry of resourceEntries) {
            if (!resourceEntry.isDirectory()) continue;

            const resourceName = resourceEntry.name;
            const operationsPath = path.join(resourcesPath, resourceName, 'operations');

            if (!fs.existsSync(operationsPath)) continue;

            const operationFiles = fs.readdirSync(operationsPath)
                .filter(file => file.endsWith('.ts'))
                .map(file => file.replace('.ts', ''));

            if (operationFiles.length > 0) {
                operationsMap.set(resourceName, operationFiles);
            }
        }

        return operationsMap;
    } catch (err) {
        console.error(chalk.red('❌ Failed to scan operations:'), err);
        return operationsMap;
    }
}

/**
 * Convert operation name to camelCase key
 * "Get Data Items" -> "getDataItems"
 * "operationOne" -> "operationOne" (preserve if already camelCase)
 * "operation one" -> "operationOne"
 */
function operationNameToKey(name: string): string {
    const trimmed = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');

    // If no spaces, check if it's already in camelCase format
    if (!trimmed.includes(' ')) {
        // Already a single word or camelCase - return as is (preserve casing)
        return trimmed;
    }

    // Has spaces - convert to camelCase
    return trimmed
        .split(/\s+/) // Split by spaces
        .map((word, index) => {
            word = word.toLowerCase();
            // Capitalize first letter of all words except the first
            if (index > 0 && word.length > 0) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            }
            return word;
        })
        .join('');
}

/**
 * Validate operation name format
 * Operation names can contain letters, numbers, and spaces
 */
function validateOperationNameFormat(name: string): boolean {
    // Allow letters, numbers, and spaces
    return /^[a-zA-Z0-9\s]+$/.test(name) && name.trim().length > 0;
}

/**
 * Ask user for operation name with validation
 * Accepts spaces for comfort, converts to camelCase for the key
 * Checks for duplicates across ALL resources and validates format
 */
export async function askForOperationName(nodeDir: string): Promise<{ name: string; key: string }> {
    const existingOperations = getExistingOperations(nodeDir);

    while (true) {
        const operationName = await askForInput('👉 Enter operation name (e.g., "Scrape Data", "Get Items"): ');

        if (!operationName) {
            console.log(chalk.yellow('⚠️  Operation name is required.'));
            continue;
        }

        // Validate format
        if (!validateOperationNameFormat(operationName)) {
            console.log(chalk.red('❌ Invalid operation name format.'));
            console.log(chalk.gray('   Use letters, numbers, and spaces only.'));
            console.log(chalk.gray('   Examples: "Scrape Data", "Get Items", "Fetch All"\n'));
            continue;
        }

        // Convert to camelCase key
        const operationKey = operationNameToKey(operationName);

        // Check for duplicates across ALL resources - must be globally unique
        let isDuplicate = false;
        for (const [resource, operations] of existingOperations.entries()) {
            if (operations.includes(operationKey)) {
                console.log(chalk.red(`❌ Operation key "${operationKey}" already exists in resource "${resource}".`));
                console.log(chalk.gray('   Operation keys must be unique across all resources. Please choose a different name.\n'));
                isDuplicate = true;
                break;
            }
        }

        if (isDuplicate) {
            continue;
        }

        // Show the generated key
        console.log(chalk.gray(`   Generated key: ${operationKey}`));

        // Name is valid and unique
        return { name: operationName, key: operationKey };
    }
}

/**
 * Ask user for operation description
 */
export async function askForOperationDescription(): Promise<string> {
    const description = await askForInput('👉 Enter operation description (optional, press Enter to skip): ');
    return description.trim() || 'Execute this operation';
}

/**
 * Get list of available resources by scanning the resources folder
 */
export function getResourcesList(nodeDir: string): string[] {
    try {
        const resourcesPath = path.join(nodeDir, 'resources');

        if (!fs.existsSync(resourcesPath)) {
            return [];
        }

        const entries = fs.readdirSync(resourcesPath, { withFileTypes: true });

        // Filter for directories only, excluding router.ts and any other files
        const resources = entries
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name);

        return resources;
    } catch (err) {
        console.error(chalk.red('❌ Failed to scan resources folder:'), err);
        return [];
    }
}

/**
 * Ask user to select a resource from available resources
 */
export async function askForResourceSelection(resources: string[]): Promise<string> {
    if (resources.length === 0) {
        throw new Error('No resources found. Please run init-actor-app first.');
    }

    console.log(chalk.cyan('📁 Available resources:'));
    resources.forEach((resource, index) => {
        console.log(chalk.gray(`   ${index + 1}. ${resource}`));
    });
    console.log('');

    while (true) {
        const answer = await askForInput(`👉 Select resource (1-${resources.length}): `);
        const index = parseInt(answer.trim(), 10) - 1;

        if (isNaN(index) || index < 0 || index >= resources.length) {
            console.log(chalk.red('❌ Invalid selection. Please enter a number between 1 and ' + resources.length + '.\n'));
            continue;
        }

        return resources[index];
    }
}

/**
 * Convert resource name to folder key
 * "Actor Data" -> "actorData"
 * "actorData" -> "actorData" (preserve if already camelCase)
 * "actor data" -> "actorData"
 */
export function resourceNameToKey(name: string): string {
    const trimmed = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');

    // If no spaces, check if it's already in camelCase format
    if (!trimmed.includes(' ')) {
        // Already a single word or camelCase - return as is (preserve casing)
        return trimmed;
    }

    // Has spaces - convert to camelCase
    return trimmed
        .split(/\s+/) // Split by spaces
        .map((word, index) => {
            word = word.toLowerCase();
            // Capitalize first letter of all words except the first
            if (index > 0 && word.length > 0) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            }
            return word;
        })
        .join('');
}

/**
 * Validate resource name format
 * Resource names can contain letters, numbers, and spaces
 */
function validateResourceNameFormat(name: string): boolean {
    // Allow letters, numbers, and spaces
    return /^[a-zA-Z0-9\s]+$/.test(name) && name.trim().length > 0;
}

/**
 * Normalize a folder name for duplicate comparison only
 * Handles snake_case vs camelCase: "resource_one" and "resourceOne" should be detected as duplicates
 * This does NOT affect the actual folder name - only used for comparison
 */
function normalizeForComparison(name: string): string {
    return name.replace(/_/g, '').toLowerCase();
}

/**
 * Ask user for resource name with validation
 * Accepts spaces for comfort, converts to camelCase for the folder key
 * Checks for duplicates and validates format
 */
export async function askForResourceName(nodeDir: string): Promise<{ name: string; key: string }> {
    const existingResources = getResourcesList(nodeDir);

    while (true) {
        const resourceName = await askForInput('👉 Enter resource name (e.g., "Actor Data", "User Tasks"): ');

        if (!resourceName) {
            console.log(chalk.yellow('⚠️  Resource name is required.'));
            continue;
        }

        // Validate format
        if (!validateResourceNameFormat(resourceName)) {
            console.log(chalk.red('❌ Invalid resource name format.'));
            console.log(chalk.gray('   Use letters, numbers, and spaces only.'));
            console.log(chalk.gray('   Examples: "Actor Data", "User Tasks", "Scraper Results"\n'));
            continue;
        }

        // Convert to camelCase key (preserves casing for single words)
        const resourceKey = resourceNameToKey(resourceName);

        // Check for duplicates - normalize both for comparison to catch snake_case vs camelCase conflicts
        // e.g., "resourceOne" should conflict with existing "resource_one"
        const normalizedNewKey = normalizeForComparison(resourceKey);
        const conflictingResource = existingResources.find(
            existing => normalizeForComparison(existing) === normalizedNewKey
        );

        if (conflictingResource) {
            console.log(chalk.red(`❌ Resource "${resourceKey}" conflicts with existing resource "${conflictingResource}".`));
            console.log(chalk.gray('   Please choose a different name.\n'));
            continue;
        }

        // Show the generated key
        console.log(chalk.gray(`   Generated folder name: ${resourceKey}`));

        // Name is valid and unique
        return { name: resourceName, key: resourceKey };
    }
}

