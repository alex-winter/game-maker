---
id: T-023
title: Draw an overhead layer above actors
status: done
priority: P1
phase: 2
type: feat
area: engine
depends_on: [T-017, T-020]
blocks: [T-029]
---

# T-023 Draw an overhead layer above actors

## Outcome

A map has a ground layer and an overhead layer. The engine draws ground, then actors, then overhead. The author chooses which layer they are painting.

## Why

Tree tops and the front of buildings must cover the player. That is a basic gen 3 read of a town.

## Scope

In:

- Two named draw passes.
- The editor can target either layer.
- Play uses the same passes, with a stand-in rectangle for the actor until T-026.

Out:

- Roof-open-when-inside behavior.
- More than these two passes. Extra ground layers can wait.

## Touch

- Domain map type, if it still has a free layer list: give layers a `pass: 'ground' | 'overhead'`.
- Engine render.

## Approach

- Sort by pass first, then by order inside the pass. Actors are drawn between the passes by the engine, not stored as a tile.

## Acceptance

- [x] A tile on the overhead layer covers the stand-in actor. A ground tile does not.
- [x] Editor and play agree.

## Test plan

- Recording-port test for draw order: ground, actor, overhead. Manual check.

## Result

- `renderFrame(port, scene, view, actors)` draws in fixed passes: legacy background, `ground` layers, actors, `overhead` layers. The layer `kind` from T-014 is the pass; list order sorts inside a pass. Recording-port test: ground, actor, overhead, regardless of list index.
- `engine/scene.ts` gains `Actor<TImage>` (rect + optional `SpriteFrame`, else a colour) and `DrawPort` gains `fillRect` for the stand-in. `viewRect` takes a `PortSize` so overlays can pass a canvas.
- Play: a red one-cell stand-in moved by the arrow keys, camera following, at zoom 2. The editor already targets either layer kind (T-020) and shows a cloud icon on overhead layers.
- Verified in headless Chrome: the centre pixel is red over an empty cell and over a ground tile, the tile colour when an overhead tile is at the actor's cell, and red again after walking out from under it.
