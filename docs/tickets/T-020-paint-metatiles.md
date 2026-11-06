---
id: T-020
title: Paint metatiles and delete placement painting
status: done
priority: P1
phase: 2
type: feat
area: editor
depends_on: [T-008, T-014, T-017, T-019]
blocks: [T-022, T-023, T-024, T-026, T-045]
---

# T-020 Paint metatiles and delete placement painting

## Outcome

Pencil, eraser, fill, and rectangle-fill write metatile ids onto the active layer. The placement stamp path is gone. A legacy placement map is still viewable as a frozen background or is imported cell-by-cell only when the image matches a known metatile; otherwise it is left visible and not editable, and the README says so.

## Why

This is the cut-over in docs/roadmap.md. Keeping two paint paths will split every later tool.

## Scope

In:

- Tools mutate the active tile grid.
- Fill replaces ids, it does not merge images.
- The engine renders the result.
- Placement painting code is deleted in this ticket.

Out:

- Undo (T-024). Strokes are still saved.
- Collision attributes beyond the metatile's own solid flag (T-022).

## Touch

- Editor tool handlers.
- `src/engine/render.ts`
- Delete placement-only branches once nothing calls them.

## Approach

- A stroke computes the next grid with a pure function (`paintCell`, `fillCells`) and then saves the map.
- Fill is flood fill on ids, bounded by the map, not by the viewport.
- Do not keep `placement-images.json` growing. Stop posting to it.

## Acceptance

- [x] Painting a 4×4 and reloading shows the same 16 cells.
- [x] Erasing one cell clears one id.
- [x] No code path writes a placement image for a brush stamp.
- [x] Editor and play render the same cells.

## Test plan

- Unit test flood fill on a grid. Manual paint, reload, open `/play`.

## Result

- Domain (`domain/map.ts`): `withRect`, `floodFill` (4-connected, bounded by the map), `findTileLayer`, `withTileLayer`, `addTileLayer`, `removeTileLayer`, `renameTileLayer`, `moveTileLayer`, and the `isTileMap` guard. Tested in `map-edit.test.ts`.
- Server: `PUT /project/maps/:mapId/tile-map` replaces one map's grid after validation. The layer write routes (`POST/PATCH/DELETE /maps/:mapId/layers`) and `POST /placement-images` are gone; `GET /placement-images` stays so legacy pictures can be decoded.
- Editor: `Client/Service/map-session.ts` holds the open map, the active tile layer, and hidden layers. `MapCanvas` tools — pencil, fill, rectangle (new), rubber — write metatile ids onto the active layer, update live during a drag, and save once on mouseup. A map without a tileset adopts the brush's tileset on the first stroke. `LayerListing`/`LayerItem` list tile layers (front first) with active, hide, rename, reorder, add, and delete.
- Deleted: `placement-painter`, `flood-fill-cells`, `LayerRepository`, `LoadedPlacement` repository, `load-placement`, `generate-image`, `extract-image-from-canvas-area`, `PlacementHistory`, the sheet-region stamp in `SheetViewer`, the "Add Player" button, the collision/player layer types.
- Legacy placements are drawn as a frozen background under the tile layers in both pages (engine order flipped, test updated). The README says they are view-only.
- Verified in headless Chrome: pencil a 4×4, erase one cell → 15 cells of id 2 persisted and shown after reload; fill of the empty region leaves only the erased cell at 0; `/play` shows the same cells; layer add/hide/move/delete round-trip to `project.json`.
