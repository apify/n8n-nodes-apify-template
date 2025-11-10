# n8n Nodes - Apify Actor Template

This project is an **n8n Apify Actor template** that lets you **create your own n8n nodes directly from any Apify Actor**.
The script generates a functional n8n community node package using your Actor’s input schema.

[Apify](https://apify.com) is a platform for developers to build, deploy, and publish web automation tools called Actors, while [n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) tool for AI workflow automation that allows you to connect various services.

## Table of contents

- [Installation](#installation)
- [Operations](#operations)
- [Credentials](#credentials)
- [Compatibility](#compatibility)
- [Usage](#usage)
- [Resources](#resources)
- [Release](#releasing-a-new-version)
- [Version History](#version-history)
- [Troubleshooting](#troubleshooting)

## Setup

### ⚙️ Prerequisites

- Node.js (recommended: v23.11.1)

---

### 1. Run the Script

After installing dependencies with:

```bash
npm i
```

run the following command to generate your n8n node:

```bash
npm run create-actor-app
```

When prompted, **enter the Actor ID** of the Apify Actor you want to convert.
Visit your Actor’s page on the [Apify Store](https://apify.com/store) to copy its Actor ID from the URL

Here’s a cleaner, more polished version of your section — keeping all context but improving clarity, structure, and readability:

---

### 2. Explore Key Code Snippets

We recommend reviewing the highlighted parts of the code you may want to customize.
You can locate them quickly by searching for the keyword (e.g. `SNIPPET 1`) in your IDE.


#### **1. Actor Schema Constants**

**Location:** Search for `SNIPPET 1` or open
```bash
/nodes/ApifyActorTemplate/ApifyActorTemplate.node.ts
```

These constants are automatically generated from your Actor’s schema and used throughout the node:

```ts
export const ACTOR_ID
export const PACKAGE_NAME
export const CLASS_NAME
export const ClassNameCamel

export const X_PLATFORM_HEADER_ID
export const X_PLATFORM_APP_HEADER_ID

export const DISPLAY_NAME
export const DESCRIPTION
```


#### **2. Change Node Icon**

**Location:** Search for `SNIPPET 2` or open
```bash
/nodes/ApifyActorTemplate/ApifyActorTemplate.node.ts
```

Update the logo of your node. `<___>` is the default value.
You can also define separate logos for **dark** and **light** modes.


#### **3. Edit Subtitle Text**

**Location:** Search for `SNIPPET 3` or open
```bash
/nodes/ApifyActorTemplate/ApifyActorTemplate.node.ts
```

Customize the subtitle displayed under your node in the n8n workflow view.

![Actor Subtitle](./docs/actor-subtitle.png)


#### **4. Edit Description**

**Location:** Search for `SNIPPET 4` or open
```bash
/nodes/ApifyActorTemplate/ApifyActorTemplate.node.ts
```

Adjust the node description (defaults to your Actor’s description).
Keep it **short and clear — ideally one sentence**, as it appears in the n8n node search.

![Apify Node Description](./docs/node-description.png)


#### **5. AI Tool Optimizations**

**Location:** Search for `SNIPPET 5` or open
```bash
/nodes/ApifyActorTemplate/resources/genericFunctions.ts
```

If your Actor is used by an **AI Agent** in n8n, you can optimize its output here.
Consider cleaning or simplifying the results to reduce unnecessary context.


## Development Guide

This section will go through how you can further develop your node.

### Run n8n Locally

Run the following command to start your local development server with hot reloading.
```bash
npm install
npm run dev
```

### Getting help

If you encounter issues:
1. Check the [Apify API documentation](https://docs.apify.com)
2. Review the [n8n Community Nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
3. Open an issue in the [GitHub repository](https://github.com/apify/n8n-nodes-apify-actor-template)

# TODOS:

TODO 1
TODO 2
TODO 3
### TODO 4: Edit ApifyActorTemplate.node.json

This file has 2 important sections:
- categories
- alias

Adjust the categories according to your Actor and add / remove alias' values which are keywords used by n8n on their node search engine

### TODO 5: Adjust the node icon

By default app uses the Apify logo with the community badge. You can change it
TODO 6

## Development Guide

### Customize Node Parameters

### Publishing Your Node

### 