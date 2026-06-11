# CLAUDE.md

## Project Purpose

A template and CLI tool for converting [Apify Actors](https://apify.com/store) into [n8n community nodes](https://docs.n8n.io/integrations/community-nodes/). The generator fetches an Actor's metadata and input schema, then scaffolds a complete n8n node package ready to customize and publish.

## Repository Structure

```
nodes/ApifyActorTemplate/   # Base template node (TypeScript, JSON, SVG)
credentials/                # Apify API key and OAuth2 credential definitions
scripts/                    # CLI generator (cli.ts, setupProject.ts, actorSchemaConverter.ts, etc.)
docs/                       # Documentation screenshots
icons/                      # Icon assets used during generation
.github/workflows/          # CI (ci.yaml) and Claude MD maintenance (claude-md-maintenance.yml)
```

After running the generator, a new directory `nodes/Apify{YourActorName}/` is created with the resulting node files.

## Technology Stack

- **Language:** TypeScript
- **Runtime:** Node.js ≥ 18.10
- **n8n framework:** `@n8n/node-cli` (build, dev, lint commands)
- **Actor data:** `apify-client` (fetches Actor metadata and input schema)
- **Testing:** Jest + ts-jest + nock
- **Linting/formatting:** ESLint 9 + Prettier
- **Build tooling:** gulp, TypeScript 5.9

## Build, Test & Run

```bash
npm install                  # Install dependencies

npm run build                # Compile TypeScript → dist/
npm run dev                  # Launch n8n at http://localhost:5678 with hot reload
npm run lint                 # Lint (ESLint)
npm run lint:fix             # Lint and auto-fix
npm test                     # Run Jest tests

npm run create-actor-app     # Interactive CLI: generate a node from an Apify Actor ID
```

CI runs lint → type-check (`tsc --noEmit`) → build on every push/PR to `main`.

## Conventions

- Generated node files live in `nodes/Apify{ActorName}/`.
- Customization points inside generated code are marked with `SNIPPET` comments — search for `SNIPPET` to find them.
- Adjust discoverability via `categories` and `alias` in `Apify{ActorName}.node.json`.
- Before publishing a generated package, replace the placeholder values in `package.json`: `AUTHOR_NAME`, `AUTHOR_EMAIL`, `PACKAGE_DESCRIPTION`.

## Key Notes for AI Assistants

- `nodes/ApifyActorTemplate/` is the **code template**, not a real node. Do not treat it as a finished integration.
- `package.json` contains literal placeholder strings (`AUTHOR_NAME`, `AUTHOR_EMAIL`, `PACKAGE_DESCRIPTION`); these are intentional and must not be filled in by tooling.
- The Claude MD Maintenance workflow (`.github/workflows/claude-md-maintenance.yml`) is a reusable workflow from `apify/workflows` triggered on every push to `main`. It keeps this file up to date automatically.
- The `npm run create-actor-app` command is the primary entry point for end users of this template — it drives the entire scaffolding process.
