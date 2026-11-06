---
id: T-021
title: Show a grid, zoom, and the cell coordinate
status: done
priority: P1
phase: 2
type: feat
area: editor
depends_on: [T-017]
blocks: []
---

# T-021 Show a grid, zoom, and the cell coordinate

## Outcome

The author can toggle a 16×16 grid, zoom the view with nearest-neighbor scaling, and read the cell under the cursor.

## Why

A town cannot be aligned by eye at 1× with no coordinates.

## Scope

In:

- Grid overlay rendered by the engine or by a view that uses the camera.
- Zoom levels that are integers (1, 2, 3, 4).
- A readout of the cell coordinate.

Out:

- Minimap.
- Rotate.

## Touch

- Engine camera: include zoom.
- Editor overlay.

## Approach

- Zoom multiplies the draw size and divides pointer movement into world pixels. Update the pointer-to-world helper from T-002 rather than adding a second formula.
- Smoothing stays off so zoomed pixels stay square.

## Acceptance

- [x] At zoom 2, a metatile is 32 screen pixels and still crisp.
- [x] The readout matches the cell that a click paints.
- [x] The grid lines land on cell borders at every zoom.

## Test plan

- Manual at zoom 1 and zoom 4. Click the corner of a cell and confirm the readout and the stamp.

## Result

- `engine/view.ts`: `View = { x, y, zoom }`, `clampZoom` (integers 1–4), `viewRect`, `worldToScreen`, `screenToWorld`, `zoomedAt`. `renderFrame` takes a `View`; draw sizes and offsets multiply by zoom, culling shrinks with it. Tests in `view.test.ts` and `render.test.ts`.
- `Client/Service/camera.ts` holds the `View` (`zoomTo` anchors on a screen point); `pointer-to-world.ts` divides by zoom — one formula, used by every tool.
- `MapCanvas`: wheel and HUD −/+ zoom, grid toggle, cell readout; ghost and rectangle overlays scale with zoom; panning divides screen pixels by zoom. `Client/Service/draw-grid.ts` strokes borders on the half pixel so lines are one device pixel at every zoom.
- `user-data.json` gains `zoom` and `showGrid` (older files fall back to 1 / on).
- `parseDataset` now decodes `true`/`false`/`null` so components can take boolean dataset values.
- Verified in headless Chrome: at zoom 2 the readout `15, 16` matched the cell a click painted; zoom 4 and a grid toggle survive reload; grid lines land on cell borders in the zoom-2 screenshot.
