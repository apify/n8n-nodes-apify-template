# AI Agent Context: n8n-nodes-apify-template

## Overview

This is a **generator repository** that creates n8n community nodes from Apify Actors. It has two main components:

1. **Template Files** (`nodes/ApifyActorTemplate/`) - Blueprint for generated nodes
2. **Generator Scripts** (`scripts/`) - Code that creates new nodes from the template

**Key Concept**: This is NOT a static codebase. When you run `npm run create-actor-app`, the scripts copy the template, fetch an Actor's schema from Apify, and generate a new node with proper naming and properties.

---

## Quick Commands

```bash
npm run create-actor-app  # Generate a new node from an Actor ID
npm run build             # Compile TypeScript + copy icons
npm run dev               # Run n8n locally with hot reload
npm test                  # Run tests (none exist yet)
npm run lint              # Check code quality
```

---

## Part 1: Template Files (What Gets Copied)

Location: `nodes/ApifyActorTemplate/`

These files serve as the blueprint for all generated nodes:

### Node Definition
- **`ApifyActorTemplate.node.ts`** - Main node class implementing `INodeType`
  - Defines node metadata (name, icon, credentials)
  - Contains `execute()` method that runs the Actor
  - Uses placeholders like `$$ACTOR_ID`, `$$CLASS_NAME` that get replaced

### Resources
- **`resources/`** - Contains resource and operation definitions with routing logic
  - **`resources/router.ts`** - Main router that merges all resources and delegates to resource-specific routers
  - **`resources/resource_one/`** - Individual resource folder (supports multiple resources)
    - **Note**: `resource_one` is a **dynamically generated name** based on user input during script execution
    - **`resource.ts`** - Resource-level file that merges operations and routes to operation handlers
    - **`operations/`** - Folder containing operation files
      - **`operation_one.ts`** - Individual operation with properties and execute function (name generated from user input)
      - **`operation_two.ts`** - Individual operation with properties and execute function (name generated from user input)
  - Gets **completely regenerated** during setup based on resource and operation count
  - **All folder/file names with underscores** (e.g., `resource_one`, `operation_one`) are **custom-named by the generator script** based on user input

### Helpers
- **`helpers/executeActor.ts`** - Actor build and execution utilities
  - `getDefaultBuild()` - Fetch Actor's default build metadata
  - `getDefaultInputsFromBuild()` - Extract prefill values from build definition
  - `runActorApi()` - Execute Actor API call with input

- **`helpers/genericFunctions.ts`** - API utilities and common execution logic
  - `apiRequest()` - Make authenticated calls to Apify API
  - `pollRunStatus()` - Poll every 1s until Actor completes
  - `getResults()` - Fetch dataset items
  - `isUsedAsAiTool()` - Detect if used by AI agents
  - `executeActorRun()` - Common execution pattern used by all operations (merges input with defaults, runs actor, waits for results)

- **`helpers/hooks.ts`** - n8n lifecycle hooks

### Metadata
- **`ApifyActorTemplate.node.json`** - Node categories and aliases

### Icons
- **`apify.svg`** / **`apifyDark.svg`** - Node icons (light/dark themes)

---

## Part 2: Generator Scripts (What Creates New Nodes)

Location: `scripts/`

### Main Flow
**`setupProject.ts`** - Orchestrates the entire generation process:
1. Prompts user for Actor ID and operation count
2. Calls `setConfig()` to create placeholder values
3. Calls `generateOperationsStructure()` to create resources/operations structure
4. Calls `refactorProject()` to rename files/folders

### Key Scripts

**`actorConfig.ts`** - Generates placeholder values:
- `$$ACTOR_ID` → `apify/instagram-scraper`
- `$$CLASS_NAME` → `ApifyInstagramScraper`
- `$$DISPLAY_NAME` → `Apify Instagram Scraper`
- `$$PACKAGE_NAME` → `n8n-nodes-apify-instagram-scraper`
- `$$X_PLATFORM_APP_HEADER_ID` → `instagram-scraper-app`

**`generateOperations.ts`** - Generates resources/operations structure:
- Creates `resources/` directory with resource folders
- Generates `resources/router.ts` main router file
- Creates individual resource folders with **custom names based on user input** (e.g., `resource_one/` where `resource_one` is dynamically generated)
- Each resource has its own `resource.ts` file that merges operations
- Creates `operations/` subfolder within each resource
- Each operation file is **dynamically named** based on user input (e.g., `operation_one.ts`)
- Each operation file defines its own operation name constant and contains properties and execute function

**`actorSchemaConverter.ts`** - Converts Apify schema → n8n properties:

| Apify Type | Apify Editor | n8n Type | Notes |
|------------|-------------|----------|-------|
| string | (default) | string | Text input |
| string | textarea | string | Multi-line with `rows: 5` |
| string | select / enum | options | Dropdown |
| string | datepicker | dateTime | Date picker |
| integer | - | number | With min/max |
| boolean | - | boolean | Toggle |
| array | - | json or fixedCollection | Depends on items |
| object | - | json | JSON editor |

**`refactorProject.ts`** - Renames files and updates imports:
- Renames `ApifyActorTemplate/` → `ApifyActorName/`
- Updates all class names and imports in resources files
- Updates `package.json` name

**`createActorApp.ts`** - Fetches Actor metadata from Apify API

**`cli.ts`** - Entry point that calls `setupProject()`

---

## Generation Flow

```
User runs: npm run create-actor-app
      ↓
Prompt for Actor ID (e.g., "apify/instagram-scraper")
      ↓
Prompt for operation count (1-10, default 2)
      ↓
Fetch Actor metadata via ApifyClient
      ↓
setConfig() → Generate placeholder values
      ↓
generateOperationsStructure() → Create resources/operations structure
      ↓
refactorProject() → Rename ApifyActorTemplate → ApifyInstagramScraper
      ↓
npm run build → Compile TypeScript
      ↓
Generated node ready in dist/
```

---

## Key Architecture Concepts

### n8n Node Structure
All n8n nodes must implement `INodeType`:
```typescript
export class ApifyActorName implements INodeType {
  description: INodeTypeDescription = { ... };
  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    // Run Actor and return results
  }
}
```

### Resource and Operation Structure
The new multi-resource architecture supports multiple resources per node:

```
resources/
├── router.ts                    # Main router - merges all resources
└── resource_one/                # Dynamically named based on user input
    ├── resource.ts              # Resource router - merges operations
    └── operations/
        ├── operation_one.ts     # Dynamically named - Defines OPERATION_1_NAME constant
        └── operation_two.ts     # Dynamically named - Defines OPERATION_2_NAME constant
```

**Key Design Principles:**
- **Dynamic naming**: All folder/file names with underscores (e.g., `resource_one`, `operation_one`) are **generated by the script based on user input** during node generation
- **Single RESOURCE_NAME variable**: Each resource defines one `RESOURCE_NAME` constant used throughout that resource
- **Operation names in operation files**: Each operation file exports its own `OPERATION_X_NAME` constant
- **Resource-level routing**: Each `resource.ts` imports operation names and routes to the correct operation handler
- **Top-level routing**: `router.ts` re-exports constants and delegates to resource-specific routers

### Apify Actor Execution Flow
1. `getDefaultBuild()` → GET `/v2/acts/{actorId}/builds/default`
2. `getDefaultInputsFromBuild()` → Extract prefill values
3. `runActorApi()` → POST `/v2/acts/{actorId}/runs` (non-blocking)
4. `pollRunStatus()` → GET `/v2/actor-runs/{runId}` every 1s
5. `getResults()` → GET `/v2/datasets/{datasetId}/items`
6. Return formatted results to n8n

### Authentication
Two methods supported:
- **API Key** (`credentials/ApifyApi.credentials.ts`) - Bearer token
- **OAuth2** (`credentials/ApifyOAuth2Api.credentials.ts`) - PKCE flow

### AI Tool Support
- Nodes marked with `usableAsTool: true`
- `isUsedAsAiTool()` detects AI context
- Can filter results to reduce LLM token usage (SNIPPET 5)

---

## 5 Customization SNIPPETs

Search for `SNIPPET` in generated code to find these:

1. **SNIPPET 1**: Actor constants (ACTOR_ID, CLASS_NAME, etc.)
2. **SNIPPET 2**: Node icon paths
3. **SNIPPET 3**: Node subtitle text
4. **SNIPPET 4**: Node description
5. **SNIPPET 5**: AI tool result filtering

---

## Critical Files Reference

| File | Purpose |
|------|---------|
| `nodes/ApifyActorTemplate/ApifyActorTemplate.node.ts` | Main node template |
| `nodes/ApifyActorTemplate/resources/router.ts` | Main router merging all resources |
| `nodes/ApifyActorTemplate/resources/resource_one/resource.ts` | Resource router merging operations (folder/file dynamically named) |
| `nodes/ApifyActorTemplate/resources/resource_one/operations/operation_one.ts` | Individual operation file (dynamically named) |
| `nodes/ApifyActorTemplate/helpers/executeActor.ts` | Actor execution logic |
| `nodes/ApifyActorTemplate/helpers/genericFunctions.ts` | API utilities |
| `scripts/setupProject.ts` | Main orchestrator |
| `scripts/actorSchemaConverter.ts` | Schema conversion |
| `scripts/actorConfig.ts` | Placeholder generation |
| `scripts/refactorProject.ts` | File renaming |
| `credentials/ApifyApi.credentials.ts` | API key auth |
| `package.json` | Dependencies & n8n node registration |

**Note**: Files/folders with underscore naming (e.g., `resource_one`, `operation_one`) are dynamically generated based on user input during script execution.

---

## Common Tasks

### Generate a New Node
```bash
npm run create-actor-app
# Enter Actor ID when prompted
npm run build
```

### Modify Template Behavior
Edit files in `nodes/ApifyActorTemplate/` - changes will apply to all future generated nodes.

### Change Schema Conversion Logic
Edit `scripts/actorSchemaConverter.ts` → modify `getPropsForTypeN8n()` function.

### Modify Polling Behavior
Edit `nodes/ApifyActorTemplate/helpers/genericFunctions.ts` → modify `pollRunStatus()` function.

### Add Custom API Headers
Edit `nodes/ApifyActorTemplate/helpers/genericFunctions.ts` → add headers in `apiRequest()` function.

---

## Important Notes

### What Gets Regenerated vs. Copied

**Regenerated (not direct copies):**
- `resources/router.ts` - Main router merging all resources
- `resources/resource_*/resource.ts` - Resource routers merging operations (folders/files dynamically named)
- `resources/resource_*/operations/*.ts` - Individual operation files with properties (dynamically named)
- Generated completely from Actor's input schema and operation count
- **Note**: The `*` in paths represents dynamically generated names based on user input (e.g., `resource_one`, `operation_one`)

**Copied & modified (placeholders replaced):**
- `ApifyActorTemplate.node.ts` - Class names and constants updated
- All helper files - Names and imports updated
- `ApifyActorTemplate.node.json` - Display name updated

### Template vs. Script Separation

- **Template files** define HOW nodes work (execution logic, API calls, polling)
- **Generator scripts** create NEW nodes by copying template and customizing it
- **Never edit generated nodes directly** - edit the template instead, then regenerate

### Testing
- Test infrastructure exists (Jest + ts-jest) but **no tests written yet**
- Create tests in `nodes/**/__tests__/**/*.spec.ts`
- Run with `npm test`

---

## Environment

- **Node.js**: v23.11.1 (see `.nvmrc`)
- **Platform**: macOS Darwin 24.6.0
- **Current Branch**: `feat/repo-simplification`
- **Working Directory**: `/Users/gokdenizkaymak/apify/n8n-nodes-apify-template`

---

## Key Dependencies

| Package | Purpose |
|---------|---------|
| n8n-workflow | n8n SDK (INodeType, IExecuteFunctions, etc.) |
| apify-client | Apify API client for fetching actors |
| typescript | Compiles .ts → .js |
| jest + ts-jest | Test framework (no tests yet) |
| @n8n/node-cli | Dev tooling (`npm run dev`, `npm run lint`) |
| gulp | Copies icons to dist/ |

---

## Troubleshooting

**Generated node doesn't appear in n8n:**
- Check `package.json` → `n8n.nodes` array includes the compiled path
- Ensure `npm run build` succeeded
- Restart n8n

**Actor execution hangs:**
- Check Actor run status in Apify console
- Polling interval is 1000ms (1 second)
- No timeout mechanism exists (known limitation)

**Schema conversion produces wrong properties:**
- Check Actor's input schema in Apify console
- Verify type mapping in `scripts/actorSchemaConverter.ts`
- Add custom handling if needed

**Build fails:**
- Run `npm install` to update dependencies
- Check for TypeScript errors in output
- Verify n8n-workflow version matches

---

## Resources

- **n8n Docs**: https://docs.n8n.io/integrations/creating-nodes/
- **Apify API**: https://docs.apify.com/api/v2
- **Repository**: https://github.com/apify/n8n-nodes-apify-template
