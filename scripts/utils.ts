import * as readline from 'readline';

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
