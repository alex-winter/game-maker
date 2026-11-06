---
id: T-020
title: Paint metatiles and delete placement painting
status: backlog
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

- [ ] Painting a 4×4 and reloading shows the same 16 cells.
- [ ] Erasing one cell clears one id.
- [ ] No code path writes a placement image for a brush stamp.
- [ ] Editor and play render the same cells.

## Test plan

- Unit test flood fill on a grid. Manual paint, reload, open `/play`.
