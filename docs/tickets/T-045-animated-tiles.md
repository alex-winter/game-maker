---
id: T-045
title: Animate water and other tiles
status: done
priority: P2
phase: 8
type: feat
area: engine
depends_on: [T-019, T-020]
blocks: []
---

# T-045 Animate water and other tiles

## Outcome

A metatile can list extra frames and a frame duration. The engine advances them with the session clock. Water on a sample map animates.

## Why

Gen 3 routes read as alive because the water moves. The data model should allow it before content is built.

## Scope

In:

- Frames on the metatile.
- Clock-driven selection, pure given the time.
- Palette UI to add frames.

Out:

- Autotile bitmasking.
- Tile animation that depends on a flag.

## Touch

- Tileset type
- Engine render
- Palette UI

## Approach

- `frameAt(metatile, timeMs)` returns the rectangle. Tests pin the boundary between frame 0 and frame 1.

## Acceptance

- [x] The test crosses a frame boundary at the authored duration.
- [x] Play shows the water cycling, and the editor can preview it.

## Test plan

- Unit test `frameAt`. Manual water tile.

## Result

- `Metatile.animation?: TileAnimation { frames: Coordinates[], frameMs }` — later frames are positions on the same sheet; the tile's own rectangle is frame 0. `frameAt(metatile, timeMs)` is pure given the clock, `frameCount`, `withAddedFrame`, `isTileAnimation`; `withMetatileAttributes` accepts `animation` (and `null` to clear); `PATCH .../metatiles/:id` validates it. Older tilesets need no migration: no field means a still tile.
- `renderFrame(port, scene, view, actors, timeMs = 0)` picks each tile's source rectangle with `frameAt`. Play passes a session clock summed from the loop's deltas; the editor passes `performance.now()`, so water moves while the author paints.
- Palette: “+ Frame” arms the next sheet click as the next frame (frames outlined green and numbered on the sheet), a ms-per-frame field, “Clear frames”, and a 32×32 preview cycling at the authored rate. `projectRepository.setMetatileAttributes` now emits `tileset-changed` and `MapCanvas` rebuilds its scene on it (before this the scene held a stale tileset after a solid toggle too).
- Tests: `frameAt` is frame 0 at 249 ms and frame 1 at exactly 250, cycles back at 750, stays in step much later; a still tile never changes; adding and clearing frames; validator cases; `renderFrame` draws frame 1's source at the boundary and frame 0 without a clock.
- Verified in headless Chrome: two frames added through the palette, the rate set to 150 ms, the preview, the editor map, and play all cycled through three distinct frames while standing still; clearing stopped it.
