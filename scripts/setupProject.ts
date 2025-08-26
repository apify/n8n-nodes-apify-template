import fs from 'fs';
import { refactorProject } from './refactorProject.ts';
import { createActorAppSchemaForN8n } from './actorSchemaConverter.ts';
import type { INodeProperties } from 'n8n-workflow';


// Targets (old names)
const TARGET_CLASS_NAME = "ApifyContentCrawler";
const TARGET_PACKAGE_NAME = "n8n-nodes-apify-content-crawler";

// Variables (new names)
const ACTOR_ID = "aYG0l9s7dbB7j3gbS";
const PACKAGE_NAME = "renamed-package";
const CLASS_NAME = "RenamedPackage";
const X_PLATFORM_HEADER_ID = "X-Platform-Header-ID";
const X_PLATFORM_APP_HEADER_ID = "X-Platform-App-Header-ID";
const DISPLAY_NAME = "Actor Display Name";

// Paths where properties should be updated
const PROPERTIES_PATHS = [
  "./nodes/ApifyContentCrawler/resources/actors/run-actor-advanced/properties.ts",
  "./nodes/ApifyContentCrawler/resources/actors/run-actor-standard/properties.ts",
];

export async function setupProject() {
  // const tmpEnv = `.env.${process.pid}.tmp`;
  // const envContent = [
  //   `PACKAGE_NAME=${PACKAGE_NAME}`,
  //   `CLASS_NAME=${CLASS_NAME}`,
  //   `ACTOR_ID=${ACTOR_ID}`,
  //   `X_PLATFORM_HEADER_ID=${X_PLATFORM_HEADER_ID}`,
  //   `X_PLATFORM_APP_HEADER_ID=${X_PLATFORM_APP_HEADER_ID}`,
  //   `DISPLAY_NAME=${DISPLAY_NAME}`,
  // ].join("\n");

  // fs.writeFileSync(tmpEnv, envContent);
  // fs.renameSync(tmpEnv, ".env");
  // console.log("✅ Wrote .env with PACKAGE_NAME, CLASS_NAME, ACTOR_ID, headers, and display name.");

  // // renames files/folders and necessary code snippets
  // refactorProject(TARGET_CLASS_NAME, CLASS_NAME, TARGET_PACKAGE_NAME, PACKAGE_NAME);

  // fetch properties from actor input schema
  console.log("⚙️  Fetching properties from actor input schema...");
  const properties = await createActorAppSchemaForN8n(ACTOR_ID) as INodeProperties[];

    // stringified export
  const newFileContent =
    `import { INodeProperties } from 'n8n-workflow';\n\n` +
    `export const properties: INodeProperties[] = ${JSON.stringify(properties, null, 2)};\n`;

  // overwrite both properties.ts files
  for (const filePath of PROPERTIES_PATHS) {
    fs.writeFileSync(filePath, newFileContent, "utf-8");
    console.log(`✅ Updated properties in ${filePath}`);
  }
}
