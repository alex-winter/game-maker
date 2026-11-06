---
id: T-008
title: Make pencil, fill, and eraser hit the cell under the cursor
status: done
priority: P0
phase: 0
type: bug
area: editor
depends_on: [T-002, T-003]
blocks: [T-020]
---

# T-008 Make pencil, fill, and eraser hit the cell under the cursor

## Outcome

The first click of a stroke stamps the cell under the pointer. Fill replaces every matching cell in the visible map with the current image, one placement per cell. Eraser removes the placement covering the cell under the pointer, including a cell that was filled.

Done in commit `fix(editor): make pencil, fill, and eraser hit the cell under the cursor (T-008)`. `CanvasLayer.runStroke` turns each mouse event into a cell through `snappedWorldPointAt` and awaits every pending stamp before it emits `layer-placement-made`, so the first stamp of a new image is persisted with its stroke. `stamp(cell, imageUuid)` is the one writer for pencil and fill. The flood region is the pure `floodFillCells` in `src/Client/Service/flood-fill-cells.ts`; cover tests are `rectContainsPoint` in `src/Model/rect-contains.ts`; `GRID_SIZE` lives in `src/Model/grid-size.ts`. `SheetViewer` selects the cells that contain both drag corners using the same `snap` (floor).

## Why

`mousedown` paints with the previous `mouseCoordinates`. Fill deletes the region and inserts one merged bitmap, so eraser only hits the bitmap's origin. Sheet selection rounds to 16 while the map floors to 16. See docs/problems.md items 6, 7, and 14.

## Scope

In:

- Pencil, fill, and eraser compute the cell from the event that fired them.
- Fill writes one placement per filled cell and does not merge a bitmap.
- Eraser removes a placement whose rectangle contains the cell, not only a placement whose origin equals the cell.
- Both snaps use the same `snap` function.

Out:

- Metatile ids (T-014). This ticket keeps placements, but stops destroying them.
- Undo (T-024).

## Touch

- `src/Client/Component/Canvas/CanvasLayer.ts`
- `src/Client/Component/SpriteSheets/SheetViewer/SheetViewer.ts`
- `src/Client/Service/snap.ts`

## Approach

- Pass the world point into `generatePlacement` and `removePlacementAt`. Do not read a field that an earlier event left behind.
- Fill's visited set stays. The part that builds `fillCanvas` and one data URL goes away. Each filled cell becomes a normal placement through the same function the pencil uses.
- A placement covers a cell when the cell origin is inside `[x, x+width) × [y, y+height)`. Erase that placement.
- `snap` is the only rounding. Sheet selection calls it. Pick floor, and use it in both places.

## Acceptance

- [x] Clicking without a prior move on that layer stamps the cell under the cursor, not `{0,0}` and not the previous cell.
- [x] Fill of an empty 4×4 area creates 16 placements. Erasing one of the middle cells removes one of them and leaves the rest.
- [x] A sheet selection edge that sits on a half-tile snaps to the same coordinate the map would.

## Test plan

- Manual pencil, fill, erase. Count rows in history before and after a 4×4 fill (+16) and one erase (-1).
