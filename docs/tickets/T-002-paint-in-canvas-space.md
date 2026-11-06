---
id: T-002
title: Paint and preview in canvas space
status: done
priority: P0
phase: 0
type: bug
area: editor
depends_on: []
blocks: [T-008]
---

# T-002 Paint and preview in canvas space

## Outcome

A stamped tile lands on the cell under the cursor, including when the side menu takes space on the left and when the page is scrolled.

Done in commit `fix(editor): paint and preview in canvas space (T-002)`. `pointerToWorld` lives in `src/Client/Service/pointer-to-world.ts` with a node test. `CanvasLayer.snappedWorldPointAt(event)` is the one place that turns a mouse event into a cell; mousedown and mousemove both go through it.

## Why

`CanvasLayer.handleMouseMove` adds `event.clientX` to the camera. Those numbers are viewport pixels. The canvas starts to the right of the side menu, so the ghost (which is `position: fixed`) and the drawn stamp disagree. See docs/problems.md item 5.

## Scope

In:

- Pointer position is converted through the canvas bounding rect before it becomes a world position.
- The ghost preview is positioned in that same canvas space, not with raw viewport coordinates.
- Panning still uses the pointer delta, which is coordinate-space independent.

Out:

- Zoom (T-021).
- Replacing placements with metatiles (T-014).

## Touch

- `src/Client/Component/Canvas/CanvasLayer.ts`
- A pure helper, for example `src/Client/Service/pointer-to-world.ts`, that takes a point, a rect, and a camera and returns a world point.

## Approach

- World x = camera.x + (clientX - rect.left). Same for y. Snap that world point.
- Draw the ghost at (snappedWorld - camera) relative to the canvas, not relative to the viewport. An element inside the layer with `position: absolute` does this. The layer already fills the canvas area.
- Use the same helper on mousedown, mousemove, and the fill start so T-008 can call it.
- Found while implementing: the layers were not actually stacked. `canvas-layer` hosts were static blocks of 100% height, so the second layer rendered below the viewport and `z-index` had no effect. The host is now `position: absolute` inside a `position: relative` `.canvas-container`, which is what the ghost positioning and the z-index rule already assumed.

## Acceptance

- [x] With the side menu open, a pencil click leaves a tile whose drawn top-left is the snapped cell under the cursor.
- [x] Panning and then painting still hits the cell under the cursor.
- [x] The ghost's top-left matches the next stamp.

## Test plan

- Manual: import any small image, select a 16×16 cell, paint along the left edge of the canvas next to the menu and in the middle. Reload and confirm the tiles did not jump.
