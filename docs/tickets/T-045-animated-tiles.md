---
id: T-045
title: Animate water and other tiles
status: ready
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

- [ ] The test crosses a frame boundary at the authored duration.
- [ ] Play shows the water cycling, and the editor can preview it.

## Test plan

- Unit test `frameAt`. Manual water tile.
