---
id: T-025
title: Create, rename, resize, and delete maps
status: done
priority: P1
phase: 2
type: feat
area: editor
depends_on: [T-013]
blocks: [T-031, T-032]
---

# T-025 Create, rename, resize, and delete maps

## Outcome

The editor lists every map in the project and can add, rename, resize, and delete one. Resize keeps the overlapping cells and fills new cells with empty.

## Why

A town and its houses are separate maps. T-013 stores them; this ticket makes them operable.

## Scope

In:

- List UI and the four operations.
- Delete asks for a confirmation in the existing modal.
- The active map is obvious.

Out:

- Connections between maps (T-031).
- Duplicating a map. Add it only if it falls out of the same functions.

## Touch

- Editor map list.
- Domain `resizeGrid` pure function.
- Server project routes from T-013.

## Approach

- `resizeGrid` is pure and tested: shrinking clips, growing pads with 0.
- Deleting the active map selects another, or an empty state if none remain.

## Acceptance

- [x] Two maps can be created, named, and switched.
- [x] Resize from 10×10 to 12×8 keeps the top-left 10×8 and drops the rest.
- [x] Delete removes the map from the project file.

## Test plan

- Unit test `resizeGrid`. Manual create, rename, switch, delete.

## Result

- Domain: `resizeGrid` (generic, top-left anchored, pads with the empty value) and `resizeTileMap` (every layer and attribute grid together), `isValidGridSize` (1–256), `MAX_MAP_SIDE`, `removeMap`. Tests include the 10×10 → 12×8 case.
- Server: `DELETE /project/maps/:mapId`, `PUT /project/maps/:mapId/size`.
- Editor: `MapSelect` now shows the active map's size with rename (prompt), resize (`MapSizeForm` in the modal), and delete (`ConfirmDialog` in the modal) next to the select and "+ Map". Deleting the active map opens another, or the new empty state in `WorldEditor` when none remain. Resize reloads the page so the session, canvas, and listing all pick up the new grid.
- Verified in headless Chrome: create, rename, resize to 12×8 (96 cells), switch via the select, delete with the modal confirm; the empty state renders with only the map list.
