---
id: T-022
title: Paint collision and elevation as attributes
status: done
priority: P1
phase: 2
type: feat
area: editor
depends_on: [T-014, T-020]
blocks: [T-028, T-050]
---

# T-022 Paint collision and elevation as attributes

## Outcome

The author can show a collision overlay and paint blocked cells and elevation. The data is an attribute grid. It is not a red image.

## Why

The current collision layer is a translucent picture. Play cannot query it. Gen 3 ledges and height changes need attributes.

## Scope

In:

- Overlay rendering from the attribute grid.
- A tool mode that paints solid on/off and a number for elevation.
- The domain `isBlocked` reads this grid, and also treats a metatile marked solid as blocked.

Out:

- Ledge direction behavior in movement (can store the field, enforcement is T-028).
- The old collision layer type. Remove it if nothing reads it after this ticket.

## Touch

- `src/domain` attribute functions
- Editor tool mode
- Engine overlay

## Approach

- One attribute cell: `{ solid, elevation, ledge }`. `ledge` is `null | 'up' | 'down' | 'left' | 'right'`.
- Painting solid does not change the picture layer.

## Acceptance

- [x] A test map with a wall of solid cells returns blocked for those cells only.
- [x] The overlay can be hidden without changing data.
- [x] Reload keeps the attributes.

## Test plan

- Domain tests plus a manual paint of a wall.

## Result

- Domain: `AttributeLayer` gains `ledge: (LedgeDirection | null)[]` (stored, not yet enforced — T-028); `CellAttributes`, `attributesAt`, `withCollision`, `withElevation`, `withLedge`, `MAX_ELEVATION`; grid-generic `withCell`, `withCellsRect`, `floodFillCells` (the tile-layer `withRect`/`floodFill` now wrap them); `withTileMapDefaults` for older files; `isTileMap` checks `ledge`. Tests: a wall of solid cells blocks those cells only; painting attributes leaves pictures untouched.
- Editor: the layer listing has two attribute rows, Collision and Elevation, that are paint targets with their own overlay eye toggles; the elevation row carries the level the pencil writes. Pencil, rubber, fill, and rectangle all work on attribute grids. `Client/Service/draw-attributes.ts` draws the overlay (red painted collision, orange metatile-solid, blue numbered elevation).
- `Component.patch` defers a nested patch triggered by a blur-time `change` so the first replace finishes on an attached tree.
- The old collision/player layer types were already removed in T-020.
- Verified in headless Chrome: a 3-cell wall and an elevation 4 cell persist and survive reload; hiding the collision overlay leaves the data in place.
