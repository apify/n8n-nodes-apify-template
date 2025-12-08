# n8n Nodes - Apify Actor Template

This template **automatically converts any Apify Actor into a fully functional n8n node** with a single command.
Simply provide an Actor ID, and the script generates a complete n8n community node package using your Actor's input schema—ready to customize and publish.

[Apify](https://apify.com) is a platform for building, deploying, and publishing web automation tools called Actors, while [n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform that connects various services and APIs.

---

## Table of Contents

- [Setup](#setup)
  - [Prerequisites](#️-prerequisites)
  - [1. Generate Your Node](#1-generate-your-node)
  - [2. Customize Your Node](#2-customize-your-node)
  - [3. Understanding the Generated Code](#3-understanding-the-generated-code)
- [Development Guide](#development-guide)
  - [Run n8n Locally](#run-n8n-locally)
  - [Testing Your Node](#testing-your-node)
  - [Publishing Your Node](#publishing-your-node)
- [Getting Help](#getting-help)

## Setup

### ⚙️ Prerequisites

- **Node.js** (recommended: v23.11.1 or higher)
- A valid Apify Actor ID (find yours at [Apify Store](https://apify.com/store))

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

When prompted, **enter the Actor ID** from your Actor's console URL.
For example, if your Actor page URL is `https://console.apify.com/actors/aYG0l9s7dbB7j3gbS/input`, the Actor ID is `aYG0l9s7dbB7j3gbS`.

**What happens next:**
- The script fetches your Actor's metadata and input schema
- Generates node files with proper naming (e.g., `ApifyWebsiteContentCrawler`)
- Converts Actor input fields into n8n node parameters
- Creates all necessary boilerplate code

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

#### Key Customization Points

The generated code includes **5 labeled snippets** you'll likely want to customize. Search for `SNIPPET` in your IDE to jump directly to each section:


#### **SNIPPET 1: Actor Schema Constants**

**Location:** [nodes/Apify{YourActorName}/Apify{YourActorName}.node.ts](nodes/Apify{YourActorName}/Apify{YourActorName}.node.ts)

Auto-generated constants derived from your Actor's metadata:

```typescript
export const ACTOR_ID = 'aYG0l9s7dbB7j3gbS'
export const CLASS_NAME = 'ApifyWebsiteContentCrawler'
export const DISPLAY_NAME = 'Apify Website Content Crawler'
export const DESCRIPTION = '<Actor description>'
```

> **Tip:** Usually no changes needed here, but you can adjust `DISPLAY_NAME` or `DESCRIPTION` if desired.

---

#### **SNIPPET 2: Node Icon**

**Location:** [nodes/Apify{YourActorName}/Apify{YourActorName}.node.ts](nodes/Apify{YourActorName}/Apify{YourActorName}.node.ts)

Customize your node's visual icon. By default, it uses the Apify logo:

```typescript
icon: {
  light: 'file:apify.svg',
  dark: 'file:apifyDark.svg'
}
```

Replace the SVG files in the node directory with your own branding.

---

#### **SNIPPET 3: Subtitle Text**

**Location:** [nodes/Apify{YourActorName}/Apify{YourActorName}.node.ts](nodes/Apify{YourActorName}/Apify{YourActorName}.node.ts)

The subtitle appears beneath your node in n8n workflows:

```typescript
subtitle: 'Run Scraper',
```

![Actor Subtitle](./docs/actor-subtitle.png)

---

#### **SNIPPET 4: Node Description**

**Location:** [nodes/Apify{YourActorName}/Apify{YourActorName}.node.ts](nodes/Apify{YourActorName}/Apify{YourActorName}.node.ts)

This description shows up in n8n's node browser:

```typescript
description: DESCRIPTION,
```

![Apify Node Description](./docs/node-description.png)

---

#### **SNIPPET 5: AI Tool Result Filtering**

**Location:** [nodes/Apify{YourActorName}/helpers/genericFunctions.ts](nodes/Apify{YourActorName}/helpers/genericFunctions.ts)

If your node is used with AI agents, optimize the returned data to reduce token usage:

```typescript
if (isUsedAsAiTool(this.getNode().type)) {
  results = results.map((item: any) => ({ markdown: item.markdown }));
}
```

**Why?** AI agents work better with clean data which take up less context.

---

#### Additional Customizations

**Node Metadata** - [nodes/Apify{YourActorName}/Apify{YourActorName}.node.json](nodes/Apify{YourActorName}/Apify{YourActorName}.node.json)
- `categories`: Where the node appears in n8n's node browser (e.g., `["Data & Storage", "Marketing & Content"]`)
- `alias`: Keywords for n8n's search (e.g., `["crawler", "scraper", "website", "content"]`)

**Authentication** - [credentials/](credentials/)
- Pre-configured for both API key and OAuth2 authentication
- Users running n8n locally will need to provide their Apify API token
- Users on n8n cloud can perform OAuth2 login

---

### 3. Understanding the Generated Code

This section explains the key files and how they work together. This knowledge will help you make advanced customizations or debug issues.

#### 🔧 Core Files Explained

The template uses a simplified, flat structure for easier understanding and maintenance:

```
nodes/Apify{YourActorName}/
├── Apify{YourActorName}.node.ts          # Main node definition
├── Apify{YourActorName}.properties.ts     # Input parameters & buildActorInput()
├── Apify{YourActorName}.node.json         # Node metadata
├── apify.svg / apifyDark.svg              # Icons
└── helpers/
    ├── executeActor.ts                     # Actor execution logic
    ├── genericFunctions.ts                 # API utilities
    └── hooks.ts                            # Lifecycle hooks
```

---

##### **1. Main Node Class** - `Apify{YourActorName}.node.ts`

**Purpose:** Defines the n8n node itself—its display name, icon, properties, and execution method.

**Key sections:**
- **Node metadata** - Name, description, icon, version
- **Properties import** - Loads input parameters from `properties.ts`
- **Execute method** - Calls `runActor()` to handle the actual execution

**When to edit:**
- Change visual appearance (icon, subtitle, description)
- Modify node metadata or version
- Add custom error handling

---

##### **2. Input Parameters** - `Apify{YourActorName}.properties.ts`

**Purpose:** Defines all input fields shown in the n8n UI (auto-generated from your Actor's input schema) and contains the `buildActorInput()` function.

**Example generated property:**
```typescript
export const actorProperties: INodeProperties[] = [
  {
    displayName: 'Start URLs',
    name: 'startUrls',
    type: 'string',
    default: '',
    required: true,
    description: 'One or more URLs to start crawling from'
  }
];

export function buildActorInput(
  context: IExecuteFunctions,
  itemIndex: number,
  defaultInput: Record<string, any>,
): Record<string, any> {
  return {
    ...defaultInput,
    startUrls: context.getNodeParameter('startUrls', itemIndex),
    maxCrawlDepth: context.getNodeParameter('maxCrawlDepth', itemIndex),
  };
}
```

**When to edit:**
- Refine field labels or descriptions after generation
- Add field validation rules
- Adjust default values
- Modify how inputs are transformed in `buildActorInput()`

---

##### **3. Execution Logic** - `helpers/executeActor.ts`

**Purpose:** Orchestrates the complete Actor run lifecycle (start → poll → fetch results).

**Main function:**
```typescript
export async function runActor(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
  // Get default input values from Actor's build
  const build = await getDefaultBuild.call(this, ACTOR_ID);
  const defaultInput = getDefaultInputsFromBuild(build);

  // Build the Actor input using values from n8n node
  const mergedInput = buildActorInput(this, i, defaultInput);

  // Start the Actor run
  const run = await runActorApi.call(this, ACTOR_ID, mergedInput, { waitForFinish: 0 });

  // Poll until completion
  const lastRunData = await pollRunStatus.call(this, run.data.id);

  // Fetch results
  const resultData = await getResults.call(this, run.data.defaultDatasetId);

  // Return results (optionally filtered for AI tools)
  if (isUsedAsAiTool(this.getNode().type)) {
    return { json: { ...resultData } };
  }
  return { json: { ...lastRunData, ...resultData } };
}
```

**When to edit:**
- Customize polling intervals or timeout behavior
- Modify result transformation logic
- Add custom status handling (e.g., partial results on timeout)

---

##### **4. API Utilities** - `helpers/genericFunctions.ts`

**Purpose:** Provides helper functions for making authenticated Apify API requests.

**Key functions:**
- `apiRequest()` - Makes authenticated HTTP requests to Apify API
- `isUsedAsAiTool()` - Detects if the node is being used by an AI agent
- `pollRunStatus()` - Polls Actor run until completion
- `getResults()` - Fetches dataset items with optional AI tool filtering

**Auto-added headers:**
```typescript
'x-apify-integration-platform': 'n8n'
'x-apify-integration-app-id': 'website-content-crawler-app'
'x-apify-integration-ai-tool': 'true' // (if used with AI)
```

**When to edit:**
- Add custom request headers
- Implement retry logic
- Filter results for AI tools (SNIPPET 5)

---

##### **5. Node Metadata** - `Apify{YourActorName}.node.json`

**Purpose:** Tells n8n where to categorize your node and what keywords to search for.

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

**When to edit:**
- Adjust categories to match your Actor's purpose
- Add relevant search keywords to `alias`
- Update documentation links

---

##### **6. Readme Template** - `README_TEMPLATE.md`

This repository contains **two README files** with different purposes:

- **`README.md`** (this file) - Instructions for **developers using this template** to generate n8n nodes from Apify Actors
- **[`README_TEMPLATE.md`](README_TEMPLATE.md)** - Template for the **generated node's documentation** that will be published with your npm package

**After running the script**, you can use `README_TEMPLATE.md` as the README for your generated node package.

---

## Development Guide

### Run n8n Locally

Start n8n with your custom node for local development:

```bash
npm run dev
```

This launches n8n with hot reloading enabled. Any changes to your node files will automatically refresh.

**Access n8n:**
- Open `http://localhost:5678` in your browser

### Publishing Your Node

// TODO: will add more details for publishing later, not certain yet.

---

### Getting Help

If you encounter issues:
1. **Apify API** - Check the [Apify API documentation](https://docs.apify.com)
2. **n8n Community Nodes** - Review the [n8n Community Nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
3. **Template Issues** - Open an issue in the [GitHub repository](https://github.com/apify/n8n-nodes-apify-instagram-scraper)
4. **n8n Community** - Ask questions in the [n8n forum](https://community.n8n.io/)
