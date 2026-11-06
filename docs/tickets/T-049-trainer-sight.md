---
id: T-049
title: Let a trainer notice the player
status: done
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

- [x] Tests: in range and clear line starts; a wall blocks; the flag suppresses.
- [x] Manual: walk in front of a trainer, get the handoff once, and not again after the flag.

## Test plan

- Domain tests. Manual on a route.

## Result

- `NpcEvent.trainer: Trainer | null` — `{ sightRange, defeatedFlagId, speciesId | null, level }` (`MAX_SIGHT_RANGE` 8, `isTrainer`); `withEventDefaults` and the server validator accept older people without it.
- `domain/sight.ts`: `lineOfSight(from, facing, range, blocked)` and `sees(...)`, pure; the field blocks the line with the map edge, the inside rule (walls, ledges), items, and other people.
- `BattleRequest.trainer: TrainerChallenge { eventId, name, defeatedFlagId } | null` — grass rolls give `null`; the same `BattleRunner` takes both.
- Field session: `FieldState.approach` freezes the player while the trainer walks up along the line; beside them the player turns and `battle` is set. `afterBattle` says `NAME wants to battle!`, sets the flag on a win; `challengedBy` stops a lost or fled fight being refought until the player walks away.
- `NpcForm` gained a “Challenges the player when they walk into view” tick with sight range, beaten flag (“+ New” makes one), creature and level; `MapCanvas.openNpcForm` passes flags and species.
- Tests: `domain/sight.test.ts` (range, off-line, behind, wall cuts the line) and three field tests (walk-up and handoff once, wall blocks, flag suppresses and loss leaves it clear). Checked in Chrome on Atomic House: placed Ace through the form, stepped into his sight, he walked up, the box said `Ace wants to battle!`, the save held the flag, and walking away and back brought no second challenge.
