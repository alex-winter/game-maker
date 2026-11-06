---
id: T-017
title: Draw a map through one engine loop
status: done
priority: P1
phase: 1
type: feat
area: engine
depends_on: [T-004, T-006, T-012, T-014]
blocks: [T-020, T-021, T-023, T-029, T-030]
---

# T-017 Draw a map through one engine loop

## Outcome

Editor and play both render by calling the same function. That function paints layers back-to-front using metatile ids when a map has them, and can still paint the legacy placement map until T-020 removes it.

## Result

`engine/draw-port.ts`, `engine/scene.ts`, `engine/render.ts` (`renderFrame`, tested with a recording port for order, culling, camera offset, and metatile cutting), and `engine/loop.ts` (`startLoop` over an injectable scheduler, tested). `Client/Service/canvas-draw-port.ts` adapts the canvas; `Client/Service/build-scene.ts` turns repositories into a `Scene`. `MapCanvas` replaces the `CanvasLayer` stack: one canvas, one loop, pointer tools on the active layer via `Client/Service/placement-painter.ts`. `play.ts` uses the same scene builder, loop, and `renderFrame`. Checked by eye: two stamps painted in the editor appear at the same cells on `/play`; hide, show, and rubber were verified by reading canvas pixels. `CanvasLayer` is deleted; `Canvas2D` stays only for the unregistered `SpriteModelMaker` sketch.

## Why

docs/decisions/0002-one-engine.md. Two loops already disagree.

## Scope

In:

- `src/engine` with a frame function that takes a map, a camera, and a draw port.
- The draw port is an interface: draw image region, clear, size, smoothing off. The browser adapts `CanvasRenderingContext2D` to it.
- Play uses it for the current view.
- The editor uses it for the active map instead of one loop per layer.

Out:

- Actors and animation (T-026, T-027).
- Input handling beyond the camera the editor already has.

## Touch

- `src/engine/render.ts`
- `src/Client/play.ts`
- `src/Client/Component/Canvas/CanvasLayer.ts` shrinks. One canvas replaces the stack.

## Approach

- Sort layers once per map change, not per frame, if the order is data.
- The legacy path draws placements through the same port so there is still one loop.
- Tests can use a fake port that records draw calls and assert order.

## Acceptance

- [x] A test with two layers records the back layer's draw before the front layer's.
- [x] Play and the editor of the same map show the same overlap, checked by eye with two tiles.
- [x] There is one animation frame loop in the editor, not one per layer.

## Test plan

- Engine unit test with a recording port. Manual compare of editor and `/play`.
