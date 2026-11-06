---
id: T-003
title: Load each placement once
status: done
priority: P0
phase: 0
type: bug
area: editor
depends_on: []
blocks: [T-008]
---

# T-003 Load each placement once

## Outcome

Each placement uuid appears once in the loaded-placement list, once in history, and once on the canvas.

Done in commit `fix(editor): load each placement once (T-003)`. `WorldEditor.setup` is the only loader at boot and calls `loadPlacement`, which now returns a promise. `CanvasLayer.setup` no longer loads. `LoadedPlacementRepository.add` ignores a uuid it already holds.

## Why

`WorldEditor.setup` decodes every placement into `loadedPlacementRepository`, then each `CanvasLayer.setup` calls `loadPlacement`, which pushes the same uuid again. See docs/problems.md item 9.

## Scope

In:

- One owner loads images into the repository.
- Opening history after a reload shows one row per placement.

Out:

- Changing the placement data model.
- Virtualizing history.

## Touch

- `src/Client/Component/WorldEditor.ts`
- `src/Client/Component/Canvas/CanvasLayer.ts`
- `src/Client/Service/load-placement.ts`
- `src/Client/Service/Repository/LoadedPlacement.ts`

## Approach

- Keep the repository as the single list. Load from `WorldEditor` only, and delete the `loadPlacement` loop inside `CanvasLayer.setup`. `loadPlacement` remains for a stamp that happens later.
- `add` refuses a uuid that is already present, so a double call cannot regress this.

## Acceptance

- [x] After reload, history row count equals the number of placements across layers.
- [x] Painting a new tile increases that count by one.
- [x] The canvas does not draw the same image twice on top of itself (check by erasing: one rubber click removes the visible tile).

## Test plan

- Seed one layer with two placements, reload, open history, expect two rows. Paint one more, expect three.
