# Project Plan: Multi-Command Script Architecture

## Current Situation

This repository generates n8n community nodes from Apify Actors. Previously, it had a single script (`npm run create-actor-app`) that initialized a complete Actor app. The codebase has been restructured to support three separate commands for more granular control.

## Architecture Changes Completed

### Script Organization
Refactored from flat structure to command-based folders:
- `scripts/cli.ts` - Command router
- `scripts/utils.ts` - Shared utilities & ALL user input functions
- `scripts/types.ts` - Shared TypeScript types
- `scripts/init-actor-app/` - Full initialization (COMPLETE)
- `scripts/add-actor-resource/` - Add resource (STUB)
- `scripts/add-actor-operation/` - Add operation (STUB)

### Key Principles Established
1. **Centralized Input**: All readline/user input MUST be in `utils.ts`
2. **No External Prompts**: Only native Node.js `readline` + `chalk` for output
3. **Command Isolation**: Each command in its own folder

## Goal: Complete the Three Commands

### 1. npm run init-actor-app 🚧 WORK IN PROGRESS
Creates a new Actor app from scratch:
- Prompts for Actor ID
- Prompts for initial operation count (default 1)
- Fetches Actor schema from Apify API
- Generates complete node structure with resources/operations
- Renames template files to match Actor name

### 2. npm run add-actor-resource 🚧 TODO
Adds a new resource to an existing Actor node:
- Prompts for resource name/identifier
- Prompts for initial operation count for this resource
- Generates new resource folder under `resources/`
- Updates `resources/router.ts` to include new resource
- Does NOT regenerate existing resources

### 3. npm run add-actor-operation 🚧 TODO
Adds a new operation to an existing resource:
- Prompts for resource to add to (or auto-detect if only one exists)
- Prompts for operation name/identifier
- Generates new operation file in resource's `operations/` folder
- Updates resource's `resource.ts` to include new operation
- Does NOT regenerate existing operations

## Next Steps

1. Implement `add-actor-resource` command
2. Implement `add-actor-operation` command
3. Ensure all commands work with the template structure
4. Test end-to-end workflow: init → add-resource → add-operation

## Technical Notes

- All commands operate on `nodes/ApifyActorTemplate/` (or its renamed version)
- Resource/operation names should follow same convention as init (snake_case folders)
- Schema conversion logic already exists in `actorSchemaConverter.ts`
- File operations should use git-aware moves when possible
