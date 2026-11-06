---
id: T-005
title: Update only the layer that changed
status: done
priority: P0
phase: 0
type: bug
area: editor
depends_on: []
blocks: [T-013]
---

# T-005 Update only the layer that changed

## Outcome

Activating a layer, toggling visibility, or reordering writes the layers that actually changed. The editor does not rebuild every canvas to do it. Draw order stays 'smaller order is in front', matching the z-index already in `CanvasLayer`.

Done in commit `fix(editor): update only the layer that changed (T-005)`. `LayerRepository.update(layer, changed)` and the private `persist` emit `layer-changed` `{ uuid, changed }`; `layers-update` is gone. `setActive` persists only the layers whose flag flipped, `toggleVisible` persists one. `CanvasLayer.applyLayerState` sets visibility, z-index, and the active class in place; the canvas is never rebuilt and `afterPatch` is removed. The rule is `drawOrder` in `src/Model/draw-order.ts` (z-index is `500 + drawOrder(layer)`). New layers are now created before `new-layer-mapped` fires so their z-index reflects the assigned order.

## Why

`LayerRepository.setActive` and `toggleVisible` call `update` for every layer. `update` always PATCHes and emits `layers-update`. Every `CanvasLayer` then `patch()`es, which tears down the canvas and starts a new loop. See docs/problems.md items 4 and 10.

## Scope

In:

- `setActive` changes the previous active layer and the new one.
- `toggleVisible` changes one layer.
- Reorder still swaps two orders and persists those two.
- The open canvases update z-index, visibility, and the active pointer-events class without rebuilding their placement list.

Out:

- Undo.
- The play-mode sort (T-006).

## Touch

- `src/Client/Service/Repository/LayerRepository.ts`
- `src/Client/Component/Canvas/CanvasLayer.ts`
- `src/Client/Component/LayerListing/LayerItem.ts`

## Approach

- Split 'mutate the in-memory layer' from 'PATCH this layer'. `setActive` PATCHes at most two layers.
- Emit a specific event (`layer-changed`) carrying the uuid and what changed, instead of a global 'rebuild everything'.
- `CanvasLayer` applies visibility, z-index, and the active class in place. It restarts the animation loop only when the canvas element was actually recreated.
- Document the order rule in a one-line function `drawOrder(layer) => -layer.order` used by the editor now and by T-006 later. Smaller order is in front.

## Acceptance

- [x] Clicking a layer in the list sends a PATCH only for layers whose `is_active` flipped.
- [x] The eye button sends one PATCH.
- [x] After either action the canvases are still the same elements (no flicker from a full rebuild) and the active layer receives the pencil.
- [x] Moving a layer up paints it in front of the layer that was previously above it, without a reload.

## Test plan

- Watch the network panel. Select between three layers and count PATCHes. Toggle visibility. Reorder and confirm the visual stack.
