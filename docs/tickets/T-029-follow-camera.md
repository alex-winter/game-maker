---
id: T-029
title: Follow the player in a 240×160 view
status: backlog
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

- [ ] Tests for clamping at each edge and for a map smaller than the view.
- [ ] In play, the player stays centered in an open area and the camera stops at a map edge while the player keeps walking.

## Test plan

- Unit tests. Manual resize of the play window.
