---
id: T-012
title: Cut a pure domain layer out of the UI
status: done
priority: P1
phase: 1
type: refactor
area: domain
depends_on: [T-011]
blocks: [T-013, T-014, T-017, T-018, T-040, T-047]
---

# T-012 Cut a pure domain layer out of the UI

## Outcome

`src/domain` holds the game types and pure rules, imports no DOM and no Express, and is what new code uses. A node test imports it without a browser.

## Result

`src/domain/coordinates.ts` (pixel `Coordinates`, `Rect`, cell `Cell`), `grid.ts` (`GRID_SIZE`, `snap`, `snapToGrid`, `pixelToCell`, `cellToPixel`), `rect.ts` (`rectContainsPoint`, `rectsIntersect`), and `id.ts` (`newId`). `Model/Coordinates`, `Model/grid-size`, `Model/rect-contains`, and `Client/Service/snap` moved there and every import was updated; no shim was left behind. Domain modules import each other relatively so `node --test` runs them without path mapping. The persisted names that still differ are listed in architecture.md under "Persisted names that do not follow the standard".

## Why

Rules currently live inside `CanvasLayer` and `play.ts`. `Dataset` is an open `any` map. Field names mix `created_at` with camelCase, and `componentConfigration` is a persisted typo. See docs/standards.md and docs/problems.md item 21.

## Scope

In:

- Create `src/domain` with coordinates, ids, and a `GridSize` of 16.
- Move pure helpers that already exist (`snap`) into domain and re-export or update imports.
- A DOM-free test that snaps a point and checks a rectangle intersection.
- Naming for new fields is camelCase. Do not migrate `created_at` or the window typo in this ticket; add a note in architecture.md listing persisted names that still differ.

Out:

- The metatile map type (T-014).
- Rewriting every component to be pretty.

## Touch

- `src/domain/**`
- `src/Client/Service/snap.ts`
- `tsconfig.json` paths if a new alias is needed. The existing baseUrl `src` already allows `domain/...`.

## Approach

- Types are `type` aliases unless a class owns an invariant.
- No `index.ts` barrel that exports everything. Tests import the module they mean.
- Keep `src/Model` as a re-export shim only if a move would touch every file. Prefer moving a type when its only clients can be updated in this ticket.

## Acceptance

- [x] `src/domain` has no import from `Client`, `Server`, `express`, or the DOM lib's runtime (types used only as data, such as numbers, are fine; `HTMLElement` is not).
- [x] `npm run typecheck` passes.
- [x] A node test imports `domain` and passes.

## Test plan

- Run typecheck and the node test.
