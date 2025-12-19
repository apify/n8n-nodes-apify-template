# AI Agent Context: n8n-nodes-apify-template

## Overview

This is a **generator repository** that creates n8n community nodes from Apify Actors. It consists of:

1. **Template Files** (`nodes/ApifyActorTemplate/`) - Blueprint for generated nodes
2. **Generator Scripts** (`scripts/`) - Code that creates new nodes from the template
3. **Build Optimization** (`scripts/pre-build/`, `scripts/post-build/`) - Trims unused functions

**Key Concept**: When you run `npm run init-actor-app`, the scripts copy the template, fetch an Actor's schema from Apify, and generate a new node with proper resource/operation structure.

---

## Quick Commands

```bash
npm run init-actor-app       # Initialize a new Actor app
npm run add-actor-resource   # Add a new resource (WIP)
npm run add-actor-operation  # Add an operation to resource (WIP)
npm run build                # Pre-build → TypeScript compile → Post-build
npm run dev                  # Run n8n locally with hot reload
npm run pre-build            # Trim unused functions (automatic)
npm run post-build           # Restore original files (automatic)
```

---

## Architecture

### Resource & Operation Structure

```
nodes/Apify{ActorName}/
├── Apify{ActorName}.node.ts        # Main node class
├── resources/
│   ├── router.ts                   # Main router merging all resources
│   └── {resource_name}/            # Resource folder (dynamically named from Actor)
│       ├── resource.ts             # Resource-level router
│       └── operations/
│           └── {operation_name}.ts # Individual operation (user-defined name)
├── helpers/
│   ├── executeActor.ts             # Actor execution utilities
│   ├── genericFunctions.ts         # API utilities
│   ├── inputFunctions.ts           # Input getter functions (auto-trimmed)
│   └── propertyFunctions.ts        # Property definitions (auto-trimmed)
└── logo/                           # Node icons
```

**Key Points:**
- Init creates **1 resource** (named after Actor) with **1 operation**
- Resource name defaults to Actor name (e.g., "Website Content Crawler")
- Operation name/description are user-defined during setup
- Helper files contain ALL possible functions initially, then get trimmed during build

---

## Generation Flow

```
npm run init-actor-app
  ↓
Prompt for Actor ID (e.g., "apify/website-content-crawler")
  ↓
Fetch Actor metadata via ApifyClient
  ↓
Prompt for operation name & description
  ↓
Generate placeholder values (ACTOR_ID, CLASS_NAME, etc.)
  ↓
Convert Apify input schema → n8n properties
  ↓
Generate inputFunctions.ts (getter for each input)
  ↓
Generate propertyFunctions.ts (n8n property for each input)
  ↓
Create resource/operation files
  ↓
Refactor: Rename ApifyActorTemplate → Apify{ActorName}
  ↓
Ready to build!
```

---

## Build Optimization (NEW)

### Pre-build Script (`scripts/pre-build/index.ts`)
1. **Backs up** `inputFunctions.ts` and `propertyFunctions.ts` to `.backups/`
2. **Analyzes** all operation files to find which functions are actually used
3. **Trims** the helper files to contain only used functions
4. **Reports** savings (typically 95-99% reduction)

### Post-build Script (`scripts/post-build/index.ts`)
1. **Restores** original files from `.backups/`
2. **Cleans up** backup directory

**Example Results:**
- `inputFunctions.ts`: 346 lines → 18 lines (94.8% smaller)
- `propertyFunctions.ts`: 18,342 lines → 79 lines (99.6% smaller)

This happens automatically during `npm run build`.

---

## Key Scripts

### `scripts/init-actor-app/index.ts`
Main orchestrator that:
- Collects user inputs (Actor ID, operation name, description)
- Generates placeholder values
- Creates resource and operation structure
- Refactors template to match Actor name

### `scripts/utils/actorSchemaConverter.ts`
Converts Apify schema → n8n properties:

| Apify Type | Apify Editor | n8n Type | Notes |
|------------|-------------|----------|-------|
| string | (default) | string | Text input |
| string | textarea | string | Multi-line with rows |
| string | select/enum | options | Dropdown |
| integer | - | number | With min/max |
| boolean | - | boolean | Toggle |
| array | - | fixedCollection | Depending on items |
| object | - | json | JSON editor |

### `scripts/utils/codeGenerators.ts`
Generates:
- `inputFunctions.ts` - Getter functions for each input parameter
- `propertyFunctions.ts` - n8n property definitions for each input

### `scripts/utils/apifyUtils.ts`
- `generatePlaceholderValues()` - Creates $$ACTOR_ID, $$CLASS_NAME, etc.
- `fetchActorInputSchema()` - Gets Actor input schema from Apify API

### `scripts/utils/refactorProject.ts`
- Renames `ApifyActorTemplate` → `Apify{ActorName}` across all files
- Updates imports and class names
- Updates `package.json` name

---

## Template Files

### Main Node (`nodes/ApifyActorTemplate/ApifyActorTemplate.node.ts`)
- Implements `INodeType` interface
- Contains `execute()` method that delegates to operations
- Uses placeholders: `$$ACTOR_ID`, `$$CLASS_NAME`, `$$DISPLAY_NAME`

### Resources (`nodes/ApifyActorTemplate/resources/`)
- **`router.ts`** - Main router that merges all resources and delegates to resource-specific routers
- **`{resource_name}/resource.ts`** - Resource router that merges operations and routes to operation handlers
- **`{resource_name}/operations/{operation_name}.ts`** - Individual operation with properties and execute function

### Helpers (`nodes/ApifyActorTemplate/helpers/`)
- **`executeActor.ts`** - `getDefaultBuild()`, `runActorApi()`, `getDefaultInputsFromBuild()`
- **`genericFunctions.ts`** - `apiRequest()`, `pollRunStatus()`, `getResults()`, `executeActorRun()`
- **`inputFunctions.ts`** - Auto-generated getter functions (e.g., `getSearchStringsArray()`)
- **`propertyFunctions.ts`** - Auto-generated n8n properties (e.g., `getSearchStringsArrayProperty()`)

---

## Important Patterns

### Input Functions
```typescript
export function getSearchStringsArray(this: IExecuteFunctions, i: number): string[] {
  const value = this.getNodeParameter('searchStringsArray', i, {}) as { values?: { value: string }[] };
  return value.values?.map(item => item.value) || [];
}
```

### Property Functions
```typescript
export function getSearchStringsArrayProperty(resourceName: string, operationName: string): INodeProperties {
  return {
    displayName: "Search terms",
    name: "searchStringsArray",
    type: "fixedCollection",
    displayOptions: { show: { resource: [resourceName], operation: [operationName] } },
    // ...
  };
}
```

### Operation Execute Pattern
```typescript
export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
  const searchStringsArray = inputFunctions.getSearchStringsArray.call(this, i);
  const actorInput: Record<string, any> = { searchStringsArray };
  return await executeActorRun.call(this, ACTOR_ID, actorInput);
}
```

---

## Actor Execution Flow
1. `getDefaultBuild()` → GET `/v2/acts/{actorId}/builds/default`
2. `getDefaultInputsFromBuild()` → Extract prefill values
3. `runActorApi()` → POST `/v2/acts/{actorId}/runs` (non-blocking)
4. `pollRunStatus()` → GET `/v2/actor-runs/{runId}` every 1s
5. `getResults()` → GET `/v2/datasets/{datasetId}/items`
6. Return formatted results to n8n

---

## Adding Resources/Operations (WIP)

**Add Resource:**
```bash
npm run add-actor-resource  # Creates new resource folder with operation
```

**Add Operation:**
```bash
npm run add-actor-operation  # Adds operation to existing resource
```

These commands create the files, update routers, and regenerate helper functions.

---

## Critical Files Reference

| File | Purpose |
|------|---------|
| `scripts/init-actor-app/index.ts` | Main initialization orchestrator |
| `scripts/utils/actorSchemaConverter.ts` | Apify → n8n schema conversion |
| `scripts/utils/codeGenerators.ts` | Generate input/property functions |
| `scripts/utils/refactorProject.ts` | Rename template → Actor name |
| `scripts/pre-build/index.ts` | Trim unused functions before build |
| `scripts/post-build/index.ts` | Restore original files after build |
| `nodes/ApifyActorTemplate/ApifyActorTemplate.node.ts` | Main node template |
| `nodes/ApifyActorTemplate/resources/router.ts` | Main resource router |
| `nodes/ApifyActorTemplate/helpers/genericFunctions.ts` | API utilities |
| `nodes/ApifyActorTemplate/helpers/executeActor.ts` | Actor execution logic |

---

## Common Tasks

### Generate a New Node
```bash
npm run init-actor-app  # Prompts for Actor ID, operation name
npm run build           # Optimizes and compiles
npm run dev             # Test in n8n
```

### Modify Template Behavior
Edit files in `nodes/ApifyActorTemplate/` - changes apply to all future generated nodes.

### Change Schema Conversion Logic
Edit `scripts/utils/actorSchemaConverter.ts` → modify type mappings.

### Modify Polling/Execution
Edit `nodes/ApifyActorTemplate/helpers/genericFunctions.ts` → modify `pollRunStatus()` or `executeActorRun()`.

---

## Environment

- **Node.js**: v23.11.1+ (see `.nvmrc`)
- **Platform**: macOS Darwin 24.6.0
- **Working Directory**: `/Users/gokdenizkaymak/apify/n8n-nodes-apify-template`

---

## Key Dependencies

| Package | Purpose |
|---------|---------|
| n8n-workflow | n8n SDK (INodeType, IExecuteFunctions, etc.) |
| apify-client | Apify API client for fetching actors |
| typescript | Compiles .ts → .js |
| chalk | CLI colors |
| glob | File pattern matching (used in pre-build) |
