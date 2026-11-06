---
id: T-019
title: Import a sheet as a tileset palette
status: done
priority: P1
phase: 2
type: feat
area: editor
depends_on: [T-007, T-014, T-015]
blocks: [T-020, T-045]
---

# T-019 Import a sheet as a tileset palette

## Outcome

From an imported sheet the author can slice 16×16 metatiles into a tileset and pick one as the current brush. The pick is a metatile id, not a loose bitmap.

## Why

Gate A maps are painted from tilesets. The sheet viewer currently emits an `HTMLImageElement` and the stamp stores a data URL.

## Scope

In:

- A tileset created from a sheet id.
- A palette UI that shows the slices and selects one.
- The current brush is a metatile id held in editor state.

Out:

- Painting that id onto a map (T-020).
- Autotiles (T-045).
- Animations on the tile.

## Touch

- Sheet viewer and a new palette element.
- `src/domain` tileset helpers from T-014.

## Approach

- Slice on the 16 grid using the domain `snap`. Store rectangles, do not copy pixels into new files yet.
- The author can mark a metatile solid in the palette. That flag lives on the metatile.

## Acceptance

- [x] Import a sheet, generate the tileset, click a cell, and the brush id is that metatile.
- [x] Reload and the tileset is still there.
- [x] Marking a metatile solid survives reload.

## Test plan

- Manual with a grid image generated in the browser or a user PNG. Confirm the JSON contains ids and rectangles, not base64.

## Result

- `domain/tileset.ts` `sliceSheet(name, sheetId, widthPx, heightPx)` slices on the 16 grid, row-major ids from 1, partial edge cells dropped; `withMetatileAttributes` updates `solid`/`elevation`/`ledge`.
- Server: `POST /project/tilesets`, `PATCH /project/tilesets/:tilesetId/metatiles/:metatileId`, `PUT /project/maps/:mapId/tileset`. `project.json` holds ids and rectangles; no base64.
- Client: `Client/Service/brush.ts` holds the current brush as `{ tilesetId, metatileId }`; `TilesetPalette` draws the sheet on the grid, selects on click, toggles Solid; `SheetViewer` gained "Use as tileset" (reuses an existing tileset for the same sheet); the side menu opens the palette for the active map's tileset.
- Verified in headless Chrome: import → use as tileset → click a cell → readout "Metatile 2" → mark solid → reload → still solid.
