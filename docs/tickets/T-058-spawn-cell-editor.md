---
id: T-058
title: Set a map's start cell in the editor
status: done
priority: P2
phase: 8
type: feat
area: editor
depends_on: [T-026, T-032]
blocks: []
---

# T-058 Set a map's start cell in the editor

## Outcome

The author can pick where play begins on a map without editing JSON. `GameMap.spawn` has a route and a control; the play host already reads it.

## Why

Building the sample town (T-051) found that `spawn` is the one field the editor cannot set: a new map starts in its centre and stays there. The town was laid out around the centre to get by.

## Scope

In:

- `PUT /project/maps/:mapId/spawn` with `{ cell }`, refused outside the grid.
- A way to place it from the map canvas — a **Start** entry in the event kind picker that sets the cell at once is enough — and a marker on the map so the author can see it.
- Keep T-026's rule: a resize that leaves the spawn outside snaps it back to the centre.

Out:

- Per-map facing at start.

## Touch

- `Server/RequestHandlers/map-lifecycle.ts`
- `Client/Component/Events/EventKindPicker.ts`, `MapCanvas.ts`
- `docs/sample-town.md` once the town can use it

## Acceptance

- [x] Pick a cell in the editor, open play on that map, and start there.
- [x] A cell off the grid is refused with a 400.

## Test plan

- Domain `withMapSpawn` is covered; add a handler-level check if the handlers gain tests. Manual in the editor.

## Result

- `PUT /project/maps/:mapId/spawn` `{ cell }` (400 for a bad shape or a cell off the grid), `projectRepository.saveSpawn`, `mapSession.commitSpawn`.
- `EventKindPicker` gains “Start here”; `drawSpawn` marks the cell with a dark P ring whenever the Events overlay is shown.
- Checked in Chrome: 400 for (40, 2) and for a string; Events row → click (11, 12) → Start here moved Fernpost Town's spawn from (10, 10) to (11, 12) and the marker followed.
