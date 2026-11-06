---
id: T-018
title: Replace the third-party element base
status: done
priority: P2
phase: 1
type: refactor
area: editor
depends_on: [T-012]
blocks: []
---

# T-018 Replace the third-party element base

## Outcome

Custom elements extend an in-repo base class. `event-driven-web-components` and the `uuid` package are gone from `package.json`. Behavior of the editor is unchanged.

## Result

`Client/Service/Component.ts` is a ~200-line base supporting exactly what the elements use: shadow root, global stylesheet links, `setup`, `css` as an adopted sheet, `build`, `afterBuild`, `patch` (replace the root and rebind), `findOne`/`findAll`, `listeners`, and `externalListeners` that are unlistened on disconnect (the library leaked them). `Client/Service/Events.ts` is the bus. `parse-dataset.ts` decodes datasets in one tested function and `Component<TDataset>` types them per element. `Dom.makeComponent` is generic and returns the concrete element, so the `as WindowBox` casts went. `componentId(Ctor)` returns the tag and replaces uuid v5. `event-driven-web-components` and `uuid` are uninstalled. Verified with headless Chrome: open a sheet, paint, hide/show, rubber, add a layer through the modal, and activate it.

## Why

docs/decisions/0004-dependencies.md. The library and `uuid` (used only to mint component ids) are runtime dependencies of every view.

## Scope

In:

- An in-repo `Component` with the lifecycle the code actually uses: `setup`, `build`, `css`, shadow root, dataset parsing, `findOne`, local listeners, and the external bus.
- Migrate the existing elements onto it.
- Component ids, if still needed for window config, are a static map from tag to a constant string. No uuid v5.

Out:

- Redesigning the windows.
- New editor features.

## Touch

- `src/Client/Service/Component.ts`
- `src/Client/Service/Events.ts`
- `src/Client/Constants/components.ts`
- `package.json`

## Approach

- Read the current call sites before writing the base. Support only what they use.
- Parse dataset JSON in one function. The `{ [key: string]: any }` dataset type does not get to spread into domain code.
- Do this ticket in one series of commits that leaves the app running in between: base first, then move element by element if needed.

## Acceptance

- [x] `package.json` no longer depends on `event-driven-web-components` or `uuid`.
- [x] `npm run typecheck` passes.
- [x] The editor still loads, paints, and opens a sheet window.

## Test plan

- Typecheck, build, and a manual pass over paint, layer list, and sheet open.
