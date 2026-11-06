---
id: T-049
title: Let a trainer notice the player
status: ready
priority: P2
phase: 8
type: feat
area: engine
depends_on: [T-043, T-048]
blocks: [T-051, T-057]
---

# T-049 Let a trainer notice the player

## Outcome

An NPC can be marked as a trainer with a sight direction, a range in cells, and a flag set when defeated. If the player steps into that line and the flag is clear, the trainer walks up and emits a `BattleRequest`. The same placeholder handler as grass runs it.

## Why

Trainers are the other half of the field battle handoff.

## Scope

In:

- Sight check, pure.
- The walk-up along empty cells.
- The flag so they do not re-battle.

Out:

- Double battles, items after battle, rematches.

## Touch

- Domain sight function
- NPC event fields
- Session

## Approach

- Sight is a straight line in the facing direction, stopped by solid cells.
- Reuse `runBattle`.

## Acceptance

- [ ] Tests: in range and clear line starts; a wall blocks; the flag suppresses.
- [ ] Manual: walk in front of a trainer, get the handoff once, and not again after the flag.

## Test plan

- Domain tests. Manual on a route.
