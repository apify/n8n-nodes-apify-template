import * as readline from 'readline';

export const PACKAGE_NAME_PREFIX = "n8n-nodes"

async function getUserInput(prompt: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
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
        const suffix = await getUserInput(`Choose a new package name. ${PACKAGE_NAME_PREFIX}-`);

        // Handle empty input or CTRL + C
        if (!suffix) {
            process.exit(0);
        }

        const candidate = `${PACKAGE_NAME_PREFIX}-${suffix}`;

        if (!validatePackageName(candidate)) {
            console.log('Invalid package name format');
            continue;
        }

        packageName = candidate;
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
