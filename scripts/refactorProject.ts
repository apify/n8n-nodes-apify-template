import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export function refactorProject(
	oldClass: string,
	newClass: string,
	oldPackage: string,
	newPackage: string,
) {
	// Rename folders and files
	const oldDir = path.join("nodes", oldClass);
	const newDir = path.join("nodes", newClass);

	if (fs.existsSync(oldDir)) {
		if (!fs.existsSync(newDir)) {
		try {
			execSync(`git mv "${oldDir}" "${newDir}"`);
		} catch {
			fs.renameSync(oldDir, newDir);
		}
		console.log(`✅ Renamed folder: nodes/${oldClass} -> nodes/${newClass}`);
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
