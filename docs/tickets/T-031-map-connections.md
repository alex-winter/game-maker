---
id: T-031
title: Connect maps along an edge
status: ready
priority: P1
phase: 4
type: feat
area: domain
depends_on: [T-014, T-025]
blocks: [T-033, T-051]
---

# T-031 Connect maps along an edge

## Outcome

The author can connect the north, south, east, or west edge of a map to another map with a cell offset. Walking off that edge continues on the other map at the matching cell.

## Why

Routes in gen 3 are seams between maps, not warps.

## Scope

In:

- Connection data on the map.
- A pure function that, given an out-of-bounds step, returns the destination map and cell.
- Editor UI to set the four edges.
- Play applies the transition with no extra fade yet (fade is T-033).

Out:

- Rendering the neighbor's tiles ahead of the seam. The player crosses, then the map changes. Streaming the neighbor can wait.

## Touch

- `src/domain/connection.ts`
- Map editor
- Play session

## Approach

- Offset is in cells along the edge. Document the sign with a test: a north connection with offset 3 lines this map's x=0 up with the other map's x=3.
- A missing destination is an authoring error shown in the editor, and the step is refused in play.

## Acceptance

- [ ] Tests for each edge and a non-zero offset.
- [ ] In play, walking south off a town arrives on the route at the authored cell, facing south.

## Test plan

- Domain tests. Manual two-map walk.
