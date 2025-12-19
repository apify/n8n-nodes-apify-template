#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface UsedFunctions {
	inputFunctions: Set<string>;
	propertyFunctions: Set<string>;
}

/**
 * Analyzes all operation files to find which input and property functions are used
 */
async function analyzeUsedFunctions(): Promise<UsedFunctions> {
	const usedFunctions: UsedFunctions = {
		inputFunctions: new Set<string>(),
		propertyFunctions: new Set<string>(),
	};

	// Find all operation files (they're in resources/*\/operations/*.ts)
	const operationFiles = await glob('nodes/*/resources/**/operations/*.ts', {
		cwd: process.cwd(),
		absolute: true,
	});

	console.log(`📊 Analyzing ${operationFiles.length} operation files...`);

	for (const operationFile of operationFiles) {
		const content = fs.readFileSync(operationFile, 'utf-8');

		// Find input function calls: inputFunctions.getFunctionName.call(this, i)
		const inputFunctionPattern = /inputFunctions\.([a-zA-Z0-9_]+)\.call\(/g;
		let match;
		while ((match = inputFunctionPattern.exec(content)) !== null) {
			usedFunctions.inputFunctions.add(match[1]);
		}

		// Find property function calls: getFunctionNameProperty(resourceName, operationName)
		const propertyFunctionPattern = /get([a-zA-Z0-9_]+)Property\(/g;
		while ((match = propertyFunctionPattern.exec(content)) !== null) {
			usedFunctions.propertyFunctions.add(`get${match[1]}Property`);
		}
	}

	console.log(`✅ Found ${usedFunctions.inputFunctions.size} used input functions`);
	console.log(`✅ Found ${usedFunctions.propertyFunctions.size} used property functions`);

	return usedFunctions;
}

/**
 * Extracts function source code from a file
 */
function extractFunctionSource(content: string, functionName: string): string | null {
	// Match export function declaration with JSDoc comments
	// This regex finds the function and its body by matching balanced braces
	const lines = content.split('\n');
	let inFunction = false;
	let braceCount = 0;
	let functionLines: string[] = [];
	let captureComment = false;
	let commentLines: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Check if we're starting a JSDoc comment
		if (line.trim().startsWith('/**')) {
			captureComment = true;
			commentLines = [line];
			continue;
		}

		// Continue capturing comment lines
		if (captureComment) {
			commentLines.push(line);
			if (line.trim().includes('*/')) {
				captureComment = false;
			}
			continue;
		}

		// Check if this is the start of our target function
		if (!inFunction && line.includes(`export function ${functionName}`)) {
			inFunction = true;
			functionLines = [...commentLines, line];
			commentLines = [];

			// Count braces on this line
			for (const char of line) {
				if (char === '{') braceCount++;
				if (char === '}') braceCount--;
			}
			continue;
		}

		// If we're in the function, capture lines and count braces
		if (inFunction) {
			functionLines.push(line);

			for (const char of line) {
				if (char === '{') braceCount++;
				if (char === '}') braceCount--;
			}

			// If braces are balanced, we've reached the end of the function
			if (braceCount === 0) {
				return functionLines.join('\n') + '\n';
			}
		}

		// Reset comment capture if we didn't find the function
		if (!inFunction && commentLines.length > 0 && !line.trim().startsWith('export function')) {
			commentLines = [];
		}
	}

	return null;
}

/**
 * Creates a trimmed version of inputFunctions.ts with only used functions
 */
function trimInputFunctions(originalPath: string, usedFunctions: Set<string>): void {
	const content = fs.readFileSync(originalPath, 'utf-8');

	// Extract imports
	const importPattern = /^import\s+[\s\S]*?from\s+['"][^'"]+['"];?$/gm;
	const imports = content.match(importPattern)?.join('\n') || '';

	// Extract each used function
	const functions: string[] = [];
	for (const functionName of usedFunctions) {
		const functionSource = extractFunctionSource(content, functionName);
		if (functionSource) {
			functions.push(functionSource);
		} else {
			console.warn(`⚠️  Could not find function: ${functionName}`);
		}
	}

	// Reconstruct the file
	const trimmedContent = `${imports}\n\n${functions.join('\n')}`;
	fs.writeFileSync(originalPath, trimmedContent, 'utf-8');

	console.log(`✂️  Trimmed inputFunctions.ts to ${usedFunctions.size} functions`);
}

/**
 * Creates a trimmed version of propertyFunctions.ts with only used functions
 */
function trimPropertyFunctions(originalPath: string, usedFunctions: Set<string>): void {
	const content = fs.readFileSync(originalPath, 'utf-8');

	// Extract imports
	const importPattern = /^import\s+[\s\S]*?from\s+['"][^'"]+['"];?$/gm;
	const imports = content.match(importPattern)?.join('\n') || '';

	// Extract each used function
	const functions: string[] = [];
	for (const functionName of usedFunctions) {
		const functionSource = extractFunctionSource(content, functionName);
		if (functionSource) {
			functions.push(functionSource);
		} else {
			console.warn(`⚠️  Could not find function: ${functionName}`);
		}
	}

	// Reconstruct the file
	const trimmedContent = `${imports}\n\n${functions.join('\n')}`;
	fs.writeFileSync(originalPath, trimmedContent, 'utf-8');

	console.log(`✂️  Trimmed propertyFunctions.ts to ${usedFunctions.size} functions`);
}

/**
 * Creates backups of the original helper files
 */
async function createBackups(): Promise<void> {
	const helperFiles = await glob('nodes/*/helpers/{inputFunctions,propertyFunctions}.ts', {
		cwd: process.cwd(),
		absolute: true,
	});

	const backupDir = path.join(process.cwd(), '.backups');

	// Create backup directory if it doesn't exist
	if (!fs.existsSync(backupDir)) {
		fs.mkdirSync(backupDir, { recursive: true });
	}

	for (const filePath of helperFiles) {
		const fileName = path.basename(filePath);
		const backupPath = path.join(backupDir, fileName);
		fs.copyFileSync(filePath, backupPath);
	}

	console.log(`💾 Created backups in ${backupDir}`);
}

/**
 * Main pre-build function
 */
async function preBuild(): Promise<void> {
	console.log('🚀 Starting pre-build optimization...\n');

	try {
		// Step 1: Create backups
		await createBackups();

		// Step 2: Analyze which functions are used
		const usedFunctions = await analyzeUsedFunctions();

		// Step 3: Find the helper files
		const inputFunctionsFiles = await glob('nodes/*/helpers/inputFunctions.ts', {
			cwd: process.cwd(),
			absolute: true,
		});

		const propertyFunctionsFiles = await glob('nodes/*/helpers/propertyFunctions.ts', {
			cwd: process.cwd(),
			absolute: true,
		});

		// Step 4: Trim the files
		for (const filePath of inputFunctionsFiles) {
			trimInputFunctions(filePath, usedFunctions.inputFunctions);
		}

		for (const filePath of propertyFunctionsFiles) {
			trimPropertyFunctions(filePath, usedFunctions.propertyFunctions);
		}

		console.log('\n✨ Pre-build optimization complete!');
		console.log('📦 The build will now only include used functions\n');
	} catch (error) {
		console.error('❌ Pre-build failed:', error);
		process.exit(1);
	}
}

// Run the pre-build script
preBuild();
