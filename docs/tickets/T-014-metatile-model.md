---
id: T-014
title: Add a metatile map and tileset model
status: backlog
priority: P1
phase: 1
type: feat
area: domain
depends_on: [T-012, T-013]
blocks: [T-017, T-019, T-020, T-022, T-026, T-031]
---

# T-014 Add a metatile map and tileset model

## Outcome

A map can store, for each layer, a grid of metatile ids. A tileset maps those ids to a rectangle on a sheet. A pure function returns the metatile at a cell and another returns whether the cell blocks movement.

## Why

Placements are pixel images. Fill already destroyed tile identity, and a walker cannot ask what is in front of them. See docs/decisions/0001-tile-grid.md and docs/problems.md item 19.

## Scope

In:

- Types: `Tileset`, `Metatile`, `TileLayer`, `AttributeLayer`.
- `Metatile` carries `solid: boolean` and an elevation number. Ledge direction can be `null` for now.
- Grids are dense arrays of ids, row-major, width then height.
- Pure functions: `cellIndex`, `metatileAt`, `isBlocked`.
- Tests for the edges: outside the map, empty cell, solid cell, different elevations.

Out:

- Painting UI (T-020).
- Importing a tileset image (T-019).
- Deleting the placement painter. That cut-over is T-020.

## Touch

- `src/domain/map.ts` and `src/domain/tileset.ts`
- Tests beside them or under `src/domain/*.test.ts`

## Approach

- An empty cell is id 0, and id 0 is never solid.
- Width and height are in cells, not pixels.
- Do not store pixels on the metatile. Store `sheetId` plus `x, y, w, h` in pixels on the sheet.
- Attribute grids use the same index math as tile grids.

## Acceptance

- [ ] A test builds a 3×3 map, sets one solid metatile, and `isBlocked` is true only there.
- [ ] A cell outside the map is blocked, so the player cannot walk into the void.
- [ ] No domain module imports the DOM.

## Test plan

- Node tests for index math, blocked cells, and elevation mismatch.
