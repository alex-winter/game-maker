---
id: T-019
title: Import a sheet as a tileset palette
status: backlog
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

- [ ] Import a sheet, generate the tileset, click a cell, and the brush id is that metatile.
- [ ] Reload and the tileset is still there.
- [ ] Marking a metatile solid survives reload.

## Test plan

- Manual with a grid image generated in the browser or a user PNG. Confirm the JSON contains ids and rectangles, not base64.
