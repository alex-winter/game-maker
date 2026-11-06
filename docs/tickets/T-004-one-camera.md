---
id: T-004
title: Share one camera across layers
status: ready
priority: P0
phase: 0
type: bug
area: editor
depends_on: []
blocks: [T-017, T-029]
---

# T-004 Share one camera across layers

## Outcome

Every layer draws with the same camera, including a layer created after the editor has loaded. Panning moves them together. Reload restores that camera.

## Why

Each `CanvasLayer` keeps a private `viewCoordinates`. New layers are built without `userData`, so they start at 0,0 while older layers resume `lastViewPosition`. The pan event copies a delta, which preserves any drift. See docs/problems.md item 8.

## Scope

In:

- One camera value is the source of truth.
- Creating a layer does not reset or fork it.
- Middle-mouse pan updates that value once.
- Persisting `lastViewPosition` still happens when the pan ends.

Out:

- Player-follow camera (T-029).
- Zoom.

## Touch

- `src/Client/Component/Canvas/CanvasLayer.ts`
- `src/Client/Component/WorldEditor.ts`
- A tiny camera module the layers read. It can live next to the editor until T-017 moves it into the engine.

## Approach

- The camera module holds `{x, y}`, with `get` and `panBy`. Layers read it in `frameFn` instead of a field.
- Initialize it from `userData.lastViewPosition` once, in `WorldEditor`, before layers build.
- Delete `moving-in-canvas`. The other layers do not need a copy of the delta if they read the same object on the next frame.
- On middle-button mouseup, persist the camera. Do not persist on every mousemove.

## Acceptance

- [ ] Paint on two layers, pan, and both layers stay aligned.
- [ ] Add a layer after panning. Its existing and new stamps use the panned camera.
- [ ] Reload restores the camera.

## Test plan

- Manual, two layers with a tile in the same cell. Pan until that cell is near the corner. Add a third layer and paint. The new tile shares the cell. Reload.
