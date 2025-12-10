# n8n Nodes - Apify Actor Template

This template converts Apify Actors into n8n community nodes. The generation script reads your Actor's input schema and creates the node package structure, which you can then customize and publish.
Simply provide an Actor ID, and the script generates a complete n8n community node package using your Actor's input schema—ready to customize and publish.

[Apify](https://apify.com) is a platform for building, deploying, and publishing web automation tools called Actors, while [n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform that connects various services and APIs.

---

## Table of Contents

- [Setup](#setup)
  - [Prerequisites](#️-prerequisites)
  - [1. Generate Your Node](#1-generate-your-node)
  - [2. Customize Your Node](#2-customize-your-node)
    - [Actor schema constants](#actor-schema-constants)
    - [Node icon](#node-icon)
    - [Subtitle](#subtitle)
    - [Node description](#node-description)
    - [AI tool result filtering](#ai-tool-result-filtering)
    - [Additional customization](#additional-customization)
    - [API utilities](#api-utilities)
    - [Node metadata](#node-metadata)
    - [README template](#readme-template)
- [Development](#development)
- [Getting help](#getting-help)

## Setup

### ⚙️ Prerequisites

- Node.js v23.11.1 or higher
- A valid Apify Actor ID from the [Apify Store](https://apify.com/store)

---

### 1. Generate Your Node

Install dependencies:
	```bash
	npm install
	```
	
	Run the generation script:
	```bash
	npm run create-actor-app
	```
	
When prompted, enter your Actor ID. Find this in your Actor's console URL, for example, if your Actor page is `https://console.apify.com/actors/aYG0l9s7dbB7j3gbS/input`, the Actor ID is `aYG0l9s7dbB7j3gbS`.
	
The script fetches your Actor's metadata and input schema, generates node files with proper naming, converts Actor input fields into n8n node parameters, and creates all necessary boilerplate code.
Test the generated node:
	```bash
	npm run build
	npm run dev
	```

---

### 2. Customize Your Node

After generation, your node files will be located in:
```
nodes/Apify<YourActorName>/
```

For example, if you converted the **Website Content Crawler** Actor, the folder will be:
```
nodes/ApifyWebsiteContentCrawler/
```

#### Customization

The generated code includes five sections labeled with `SNIPPET` comments. Search for `SNIPPET` in your IDE to locate them quickly.

##### Actor schema constants

Location: `nodes/Apify{YourActorName}/Apify{YourActorName}.node.ts`
The script generates these constants from your Actor's metadata:
	```typescript
	export const ACTOR_ID = 'aYG0l9s7dbB7j3gbS'
	export const CLASS_NAME = 'ApifyWebsiteContentCrawler'
	export const DISPLAY_NAME = 'Apify Website Content Crawler'
	export const DESCRIPTION = ''
	```
> **Tip:** Change `DISPLAY_NAME` or `DESCRIPTION` to adjust how your node appears in the n8n interface.

---

##### Node icon

Location: `nodes/Apify{YourActorName}/Apify{YourActorName}.node.ts`
The default configuration uses the Apify logo:
	```typescript
	icon: {
	  light: 'file:apify.svg',
	  dark: 'file:apifyDark.svg'
	}
	```
Replace the SVG files in the node directory with your own branding.

---

##### Subtitle

Location: `nodes/Apify{YourActorName}/Apify{YourActorName}.node.ts`
The subtitle appears beneath your node in n8n workflows:
	```typescript
	subtitle: 'Run Scraper',
	```
![Actor Subtitle](./docs/actor-subtitle.png)

---

##### Node description

Location: `nodes/Apify{YourActorName}/Apify{YourActorName}.node.ts`
This description appears in n8n's node browser:
	```typescript
	description: DESCRIPTION,
	```
![Apify Node Description](./docs/node-description.png)

---

### AI tool result filtering

Location: `nodes/Apify{YourActorName}/helpers/genericFunctions.ts`
When your node runs in AI agent workflows, reduce token usage by filtering the returned data:
	```typescript
	if (isUsedAsAiTool(this.getNode().type)) {
	  results = results.map((item: any) => ({ markdown: item.markdown }));
	}
	```
AI agents perform better with clean, focused data that takes up less context.
---
#### Additional customization

The `Apify{YourActorName}.node.json` file controls where your node appears in n8n:
	```json
	{
	  "categories": ["Data & Storage", "Marketing & Content"],
	  "alias": ["crawler", "scraper", "website", "content"]
	}
	```
Adjust `categories` to match your Actor's purpose and add relevant search keywords to `alias`.
The template includes pre-configured authentication in the `credentials/` directory. Users running n8n locally provide their Apify API token. Users on n8n cloud can authenticate via OAuth2.

---

##### API utilities

File: `helpers/genericFunctions.ts`
This file provides helper functions for authenticated Apify API requests. The `apiRequest()` function makes authenticated HTTP requests to the Apify API. The `isUsedAsAiTool()` function detects if the node runs in an AI agent workflow. The `pollRunStatus()` function polls an Actor run until completion. The `getResults()` function fetches dataset items with optional AI tool filtering.
The template adds these headers automatically:
	```typescript
	'x-apify-integration-platform': 'n8n'
	'x-apify-integration-app-id': 'website-content-crawler-app'
	'x-apify-integration-ai-tool': 'true' // when used with AI
	```
Add custom request headers, implement retry logic, or filter results for AI tools in this file.
---

##### Node metadata

File: `Apify{YourActorName}.node.json`
This file tells n8n where to categorize your node and what keywords to search for:
	```json
	{
	  "categories": ["Data & Storage", "Marketing & Content"],
	  "alias": ["apify", "crawler", "scraper", "website", "content"],
	  "resources": {
	    "credentialDocumentation": [
	      { "url": "https://docs.apify.com/platform/integrations/api#api-token" }
	    ],
	    "primaryDocumentation": [
	      { "url": "https://apify.com/apify/website-content-crawler" }
	    ]
	  }
	}
	```
Adjust categories, add search keywords to `alias`, and update documentation links.

---

##### README template

This repository contains two README files. This file (`README.md`) provides instructions for developers using this template to generate n8n nodes from Apify Actors. The `README_TEMPLATE.md` file provides template documentation for the generated node package that you publish to npm.
After running the generation script, uses `README_TEMPLATE.md` as the README for your generated node package.

---

##### API utilities

File: `helpers/genericFunctions.ts`
This file provides helper functions for authenticated Apify API requests. The `apiRequest()` function makes authenticated HTTP requests to the Apify API. The `isUsedAsAiTool()` function detects if the node runs in an AI agent workflow. The `pollRunStatus()` function polls an Actor run until completion. The `getResults()` function fetches dataset items with optional AI tool filtering.
The template adds these headers automatically:
	```typescript
	'x-apify-integration-platform': 'n8n'
	'x-apify-integration-app-id': 'website-content-crawler-app'
	'x-apify-integration-ai-tool': 'true' // when used with AI
	```
Add custom request headers, implement retry logic, or filter results for AI tools in this file.
---
##### Node metadata

File: `Apify{YourActorName}.node.json`
This file tells n8n where to categorize your node and what keywords to search for:
	```json
	{
	  "categories": ["Data & Storage", "Marketing & Content"],
	  "alias": ["apify", "crawler", "scraper", "website", "content"],
	  "resources": {
	    "credentialDocumentation": [
	      { "url": "https://docs.apify.com/platform/integrations/api#api-token" }
	    ],
	    "primaryDocumentation": [
	      { "url": "https://apify.com/apify/website-content-crawler" }
	    ]
	  }
	}
	```
Adjust categories, add search keywords to `alias`, and update documentation links.
---
##### README template

This repository contains two README files. This file (`README.md`) provides instructions for developers using this template to generate n8n nodes from Apify Actors. The `README_TEMPLATE.md` file provides template documentation for the generated node package that you publish to npm.
After running the generation script, uses `README_TEMPLATE.md` as the README for your generated node package.
---

## Development

Start n8n with your custom node:
	```bash
	npm run dev
	```
This launches n8n at `http://localhost:5678` with hot reloading enabled. Changes to your node files automatically refresh.

## Getting help

- [Apify API documentation](https://docs.apify.com)
- [n8n Community Nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [n8n community](https://community.n8n.io/)
- Template issues - Open an issue in the [GitHub repository](https://github.com/apify/n8n-nodes-apify-instagram-scraper)
