---
id: T-011
title: Add typecheck and a documented way to run
status: ready
priority: P1
phase: 0
type: chore
area: repo
depends_on: []
blocks: [T-012, T-016]
---

# T-011 Add typecheck and a documented way to run

## Outcome

`npm run typecheck` runs `tsc --noEmit` and passes. `npm start` serves the editor. The root README says the two commands and points at `docs/README.md`.

## Why

The repo installs TypeScript and a linter and never calls them. The server is not an npm script. A later agent cannot tell a green change from an unchecked one. See docs/problems.md item 23.

## Scope

In:

- A `typecheck` script.
- A `start` script that runs the built server, with a `build` script that produces `dist/server.js` and `public/dist`.
- README run steps: install, build, start, open the editor.
- Remove the deprecated `tslint` dependency if nothing references it.

Out:

- Fixing every existing lint style nit.
- A test runner beyond what T-010 needs. If you add one, use `node --test` on `*.test.ts` compiled or on a tiny ts runner already justified by the dependency decision. Do not add Jest.
- Choosing a process manager.

## Touch

- `package.json`
- `README.md`
- `tsconfig.json` only if `noEmit` for the script needs a separate config so the server build still emits

## Approach

- Keep the webpack builds. `build` runs both webpack configs once. `start` runs `node dist/server.js`.
- `typecheck` can be `tsc --noEmit --pretty false`. If the webpack config is pulled in by `include`, exclude it or give `tsc` a config that includes only `src`.
- Do not bump TypeScript in this ticket.

## Acceptance

- [ ] `npm run typecheck` exits 0 on the commit that adds it.
- [ ] `npm run build && npm start` serves `/` and `/play`.
- [ ] The root README states those commands in order.

## Test plan

- Run the three commands.
