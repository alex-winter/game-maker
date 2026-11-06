---
id: T-044
title: Let NPCs look around or wander
status: done
priority: P2
phase: 7
type: feat
area: engine
depends_on: [T-028, T-042]
blocks: []
---

# T-044 Let NPCs look around or wander

## Outcome

An NPC behavior is `still`, `look`, or `wander`. Look turns in place on a timer. Wander steps to a random adjacent cell that `canStep` allows and that is not the player's cell. The player cannot enter an occupied cell.

## Why

A town where everyone is a statue fails the 'people' part of the benchmark, but `still` must remain an option.

## Scope

In:

- The three behaviors.
- Occupancy in `canStep` for both the player and a wandering NPC.
- Editor control for the behavior.

Out:

- Scripted paths.
- Collision with other NPCs beyond 'do not step onto an occupied cell'.

## Touch

- Domain movement
- Session update
- Editor NPC form

## Approach

- The behavior step is a pure function of state and a random source. Tests pass a fixed sequence of numbers.
- Pause behavior while a message is open.

## Acceptance

- [x] A test wander with a stub RNG never chooses a solid cell.
- [x] The player is blocked by the NPC's cell.
- [x] In play, a look NPC turns and a wander NPC moves.

## Test plan

- Domain tests with a fixed RNG. Manual in play.

## Result

- `NpcEvent.behavior: 'still' | 'look' | 'wander'` (`NPC_BEHAVIORS`, `isNpcBehavior`, `DEFAULT_BEHAVIOR`); `withEventDefaults` gives people saved before this ticket `still`, and `withProjectDefaults` applies it to every map. `NpcForm` gained a "Does" select.
- `domain/npc-behavior.ts`: `NpcMotion` (home cell, a `Player`-shaped mover, the pause left) and `tickNpcMotion` — a pure function of the motion, the behavior, the frame time, a `CanEnter`, and a `Random` source. Look turns in place; wander tries a step and only turns when refused; a leash of `WANDER_RADIUS` cells from home. `restingCell(player)` in movement.
- Field session: `people` motions are synced from the map's events each frame, ticked before the player steps, and dropped on a transition. Occupancy both ways: a person cannot step onto an item, another person (standing or stepping), the player, or off the map; the player cannot enter a cell a person stands on or is stepping between. People pause (finishing their step) while a message, the menu, or the bag screen is open. `liveEvents` lets the interact key find a wanderer where they stand, and `npcMover` is what the hosts draw (`npcActor` now takes a mover and shows the walk frame mid-step).
- Tests: still never moves; look turns on the timer and never steps; wander with a stub RNG over 30 s never chooses a solid cell, never enters the rock, stays within the leash; a refused step still turns; the leash stops a straight walk at two cells. Field: a wanderer blocks the player where they stand and where they land and is found by the interact key at their new cell; the player cannot enter a cell being left; a looker turns and holds while a message is open; a wanderer never steps onto a potion or another person.
- Verified in headless Chrome: the form saves and reopens with `wander`; in play a wandering Rover moved cells and a looking Looker turned over six seconds while the stored event cell stayed put.
