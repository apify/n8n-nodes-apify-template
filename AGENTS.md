# AGENTS.md

Guidance for coding agents working in this repository. `CLAUDE.md` is only an `@AGENTS.md` pointer,
so put instructions here and leave the pointer alone. Nothing updates this file automatically, so
update it in the same PR as the code it describes.

## Project

A generator that turns one Apify Actor into an n8n community node package. Users take a copy of
the repo, run `npm run create-actor-app`, enter an Actor ID, and the CLI rewrites the clone **in place** into
`n8n-nodes-<actor-name>` with a node at `nodes/Apify<ActorName>/`, which they then customize and
publish to npm themselves.

So the repo holds two things:

- **The node template** — `nodes/ApifyActorTemplate/` and `credentials/`. It is not a real node: the
  constants are `$$PLACEHOLDER` strings and `ApifyActorTemplate.properties.ts` is leftover output
  from some Actor and an older `properties.ts.tpl` (a single `categoryUrls` field, none of the
  current helper functions). It still has to lint, type-check and build, since
  CI runs on it.
- **The generator** — `scripts/`, run with `npx tsx`, plus the code templates in
  `scripts/functionTemplates/`.

Most PRs to this repo, usually from forks, only add rows to the README's "Published Nodes" table.

## Commands

```bash
npm install
npm run create-actor-app   # interactive; set APIFY_TOKEN for private Actors
npm run build              # n8n-node build -> dist/ (also copies the .svg/.png icons)
npm run dev                # n8n at http://localhost:5678 with the node linked, hot reload
npm run lint               # n8n-node lint (ESLint 9); lint:fix to autofix
npx tsc --noEmit           # type check, same as CI
```

CI (`ci.yaml`) runs lint → `tsc --noEmit` → build on Node 22.x for pushes and PRs to `main`.
`.nvmrc` and the README say Node 23.11.1, `package.json` engines say `>=18.10`.

Broken, don't rely on them: `npm test` fails because there is no `jest.config.js` and there are no
tests; `npm run merge:api` points at a missing `openapi.config.json`. `gulpfile.js` is not used by
any script. Nothing under `scripts/` is checked: `tsconfig.json` only includes `nodes/`,
`credentials/` and `package.json`, ESLint ignores `scripts/**`, and `actorSchemaConverter.ts` is
`// @ts-nocheck`. To exercise the generator you have to run it against a real Actor.

## Architecture

### The generator is a one-shot, in-place rewrite

`scripts/cli.ts` → `setupProject()` fetches the Actor with `apify-client`, then:

1. **`setConfig`** (`actorConfig.ts`) derives the values: class `Apify` + PascalCase of
   `actor.name` (not the title), display name `Apify <title>`, package `n8n-nodes-<actor.name>`,
   app-id header `<actor.name>-app`, and `ACTOR_ID` = `actor.id` whatever form the user typed.
   It checks the package name against the npm registry and keeps prompting for a new suffix while
   it's taken. It downloads `actor.pictureUrl` into the template folder (PNG/JPEG resized to a 60×60
   `logo.png` with `sharp`, replacing `logo.svg`; SVG becomes `logo.svg`; otherwise the Apify logo
   stays) and fixes the `logo.*` references. It fills the `$$` placeholders, but **only in
   `ApifyActorTemplate.node.ts`**.
2. **`generateActorResources`** (`actorSchemaConverter.ts`) reads the input schema from the Actor's
   default build (`defaultRunOptions.build`, else `latest`), converts it to n8n properties, and
   **overwrites** two template files from `scripts/functionTemplates/`: `properties.ts.tpl` →
   `ApifyActorTemplate.properties.ts` and `execute.ts.tpl` → `helpers/executeActor.ts`.
3. **`refactorProject`** (`refactorProject.ts`) `git mv`s the folder and files to the new class
   name, then string-replaces `ApifyActorTemplate` and `n8n-nodes-apify-actor-template` in every
   file except paths containing `node_modules`, `dist`, `docs`, `credentials` or `.git` (which also
   skips `.github/`) and anything under `scripts/`. That is how `package.json` (name, `n8n.nodes`
   path), `package-lock.json`, `tsconfig.json` and this file get renamed. The credentials get a
   separate pass that only rewrites their icon path.

Consequences:

- There is no undo and no second run: once the template folder is renamed the CLI has nothing to
  work on. To test the generator, run it in a scratch clone (or `git stash -u` / `git checkout .`
  and `git clean` afterwards) and never commit its output here.
- A failure halfway (missing build tag, no input schema) leaves the template folder partly
  rewritten: the node file's placeholders and icon are already done. An unknown Actor fails before
  anything is written. `cli.ts` prints the error and exits with code 0.
- The string replacement is plain-text and repo-wide, so a new file that mentions
  `ApifyActorTemplate` gets rewritten in every generated package, and a new file under a path
  containing one of the excluded words is silently skipped.

### Two files have a twin in `scripts/functionTemplates/`

`helpers/executeActor.ts` and `ApifyActorTemplate.properties.ts` are regenerated, so editing them
alone changes nothing for users. Change execution logic in `execute.ts.tpl` and mirror it in
`executeActor.ts` (today they're identical apart from `{{TARGET_CLASS_NAME}}`), so the template
still compiles and matches what users get. Property helpers and the authentication selector
belong in `properties.ts.tpl`. Everything else in the node folder — `node.ts`, `node.json`,
`helpers/genericFunctions.ts`, `logo.svg` — is copied with only placeholder and name
replacement, so edit it directly.

### Input schema → n8n properties

`getPropsForTypeN8n` maps each Actor input field by `type` and `editor`: strings to `string`
(5 rows for `textarea`/`javascript`/`python`), `options` (`select` editor or `enum`) or
`dateTime` (`datepicker`); `integer`/`number` to `number` with min/max; `boolean` to `boolean`;
arrays to `fixedCollection` (`stringList`, `keyValue`, `requestListSources`), `multiOptions` (`select`) or
`json`; objects to `json`. Unknown types fall back to `string` with a warning. The default is the
schema `default`, else `prefill`, else `''` (for `json` fields only `default` is JSON-stringified,
not `prefill`); `number`, `boolean`, `fixedCollection` and `multiOptions` fields override that with
`default ?? 0`, `default ?? false`, `{}` and `[]`, ignoring `prefill`.

`buildParameterAssignments` emits the body of `buildActorInput`, and its branches have to match
the helper names in `properties.ts.tpl`: `fixedCollection` goes through `getFixedCollectionParam`
(`stringList` rows are mapped to plain strings), `json` through `getJsonParam` (parses strings,
throws on invalid JSON, drops empty), `dateTime` and optional `string` through `getOptionalParam`
(dropped when empty), and everything else is sent as is.

### Runtime of a generated node

`runActor` (in `executeActor.ts`) GETs `/v2/acts/{id}/builds/default`, takes each input field's
`prefill` from that build, layers the node's parameters over it, POSTs the run with
`waitForFinish=0`, polls `/v2/actor-runs/{id}` every second until a terminal status (**no
timeout**), then GETs the whole default dataset in one request (no pagination).

- The node returns **one n8n item per input item**, not one per dataset row: run metadata spread
  together with the dataset array, so rows appear under keys `"0"`, `"1"`, …, each wrapped as
  `{ json: row }`. In AI-tool mode the run metadata is left out.
- `apiRequest` (`genericFunctions.ts`) resolves the credentials named by the `authentication`
  parameter and sends `x-apify-integration-platform: n8n`, `x-apify-integration-app-id`, and
  `x-apify-integration-ai-tool: true` when `isUsedAsAiTool()` sees a node type ending in
  `<classNameCamel>Tool` (n8n's tool clone; nodes set `usableAsTool: true`).
- Credentials: `apifyApi` (Bearer API key, tested against `/v2/me`) and `apifyOAuth2Api` (PKCE,
  scopes `profile full_api_access`). The README tells users OAuth2 is for n8n cloud.

## Conventions and gotchas

- The five `// SNIPPET n` comments in the template are the documented customization points, and
  the README's customization section is built around them. Keep them, and update the README if
  you move or change one.
- `package.json` keeps the literal `AUTHOR_NAME`, `AUTHOR_EMAIL` and `PACKAGE_DESCRIPTION`, and the
  `$$...` constants in `ApifyActorTemplate.node.ts` must stay unfilled. Users or the CLI fill them;
  tooling must not.
- Everything in this repo ships to every user's clone, including `.github/workflows/` and this
  file. That is why the repo has no `agents-md-maintenance.yml`: in a clone it would only fail
  for lack of Apify's API key. Don't add workflows that need Apify secrets.
- The `n8n.nodes` / `n8n.credentials` paths in `package.json` point at `dist/`, so build before
  linking the package into n8n. `dist/` is gitignored.
