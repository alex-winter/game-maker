---
id: T-044
title: Let NPCs look around or wander
status: backlog
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

- [ ] A test wander with a stub RNG never chooses a solid cell.
- [ ] The player is blocked by the NPC's cell.
- [ ] In play, a look NPC turns and a wander NPC moves.

## Test plan

- Domain tests with a fixed RNG. Manual in play.
