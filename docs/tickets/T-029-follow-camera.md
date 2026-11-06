---
id: T-029
title: Follow the player in a 240×160 view
status: done
priority: P1
phase: 3
type: feat
area: engine
depends_on: [T-004, T-017, T-023, T-026]
blocks: [T-030]
---

# T-029 Follow the player in a 240×160 view

## Outcome

Play mode shows a 240×160 world view scaled by an integer to the window, nearest-neighbor. The camera keeps the player centered until it hits the map edge.

## Why

That is the gen 3 picture. The editor can keep its free camera.

## Scope

In:

- A pure `cameraFor(playerPixel, viewSize, mapPixelSize)`.
- Letterboxing when the window aspect does not match.
- Smoothing disabled.

Out:

- Camera shake, cutscenes, or look-ahead.

## Touch

- `src/engine/camera.ts`
- `src/Client/play.ts` host

## Approach

- The view size in world pixels is 240×160. Scale is the largest integer that fits the window, at least 1.
- Clamp the camera so the view does not show outside the map unless the map is smaller than the view, in which case center the map.

## Acceptance

- [x] Tests for clamping at each edge and for a map smaller than the view.
- [x] In play, the player stays centered in an open area and the camera stops at a map edge while the player keeps walking.

## Test plan

- Unit tests. Manual resize of the play window.

## Result

- `engine/camera.ts`: `GBA_VIEW` (240×160), `integerScale(window, view)` (largest whole scale ≥ 1), `cameraFor(focus, view, mapPixels)` (centre, clamp per axis, centre a smaller map). Tests cover each edge, both clamp boundaries, a small map, a tall map, and the scale.
- `play.ts` sizes the canvas to `GBA_VIEW × scale` on load and resize and lets the black body letterbox it (`play.css` centres the canvas, `image-rendering: pixelated`); the view each frame is `cameraFor` on the player's cell centre with `zoom = scale`.
- Verified in headless Chrome: 1000×600 → 720×480 canvas at (140, 60); 500×480 → 480×320. The player sits at the canvas centre in the open; walking to the top-left corner stops the camera at (0, 0) while the player reaches the corner cell.
