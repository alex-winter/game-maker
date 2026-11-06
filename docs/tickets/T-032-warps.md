---
id: T-032
title: Warp through doors and stairs
status: done
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

- [x] A test: stepping onto a door cell yields the destination and facing.
- [x] Spawning on the return warp does not instantly bounce back.
- [x] In play, enter a house and walk back out.

## Test plan

- Domain tests. Manual house with two warps.

## Result

- `domain/warp.ts`: `Warp`, `MapEvent` (union with room for NPCs), `newWarp`, `warpAt`, `withEvent`, `withoutEvent`, `warpTaken`, `isMapEvents`. Rule locked by test: a warp fires only when a step **finishes** on its cell; standing on one (spawned or arrived) or being mid-step over it does not fire, so a return warp cannot bounce the player back.
- `GameMap.events` (defaults to `[]`), `withMapEvents`, `PUT /project/maps/:mapId/events` (cells on the map, destinations must exist). `isCell` moved to `domain/coordinates.ts`.
- Editor: an **Events** row in the layer listing is a paint target; a canvas click opens `WarpForm` to place or edit the warp on that cell (destination map, arrival cell validated against that map's size, facing); the rubber removes it; `draw-events.ts` draws a purple "W" marker with its own visibility toggle. `mapSession.commitEvents` saves.
- Play: `warpTaken` after each step; the host opens the destination map and places the player at `toCell` facing `facing`.
- Verified in headless Chrome: placed a door through the form, added the return warp, walked into the "house" (facing up), out again (facing down), and back in; arriving on the return warp did not bounce.
