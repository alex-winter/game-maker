---
id: T-032
title: Warp through doors and stairs
status: backlog
priority: P1
phase: 4
type: feat
area: domain
depends_on: [T-025, T-026]
blocks: [T-033, T-051]
---

# T-032 Warp through doors and stairs

## Outcome

The author can place a warp on a cell: destination map, destination cell, and arrival facing. Stepping onto it moves the player there. A house door and an exit are two warps.

## Why

Entering a house is the milestone the project is named around.

## Scope

In:

- Warp event type and pure `warpAt(map, cell)`.
- Editor placement and removal of warps.
- Play applies the warp when a step completes on that cell.

Out:

- Door opening animation.
- The fade (T-033).

## Touch

- `src/domain/warp.ts`
- Editor object layer, even if NPCs are not in yet. A list of events on the map is the model.
- Play session

## Approach

- Warps are data on the map, not tiles. The picture of the door is just a metatile.
- Arrival cell should not immediately fire a warp back. Ignore warps for one step after arrival, or require the warp to be stepped onto rather than spawned onto. Lock the chosen rule in a test.

## Acceptance

- [ ] A test: stepping onto a door cell yields the destination and facing.
- [ ] Spawning on the return warp does not instantly bounce back.
- [ ] In play, enter a house and walk back out.

## Test plan

- Domain tests. Manual house with two warps.
