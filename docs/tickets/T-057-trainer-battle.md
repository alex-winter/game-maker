---
id: T-057
title: Run trainer battles through the battle scene
status: backlog
priority: P1
phase: 9
type: feat
area: engine
depends_on: [T-049, T-053]
blocks: []
---

# T-057 Run trainer battles through the battle scene

## Outcome

A trainer's `BattleRequest` includes their party of one or more creatures, fought in order. Winning sets the defeated flag. Losing uses the same restore path as a wild loss and does not set the flag.

## Why

Gate C's trainer fight is the same battle scene as wild fights, with a different request.

## Scope

In:

- Trainer party on the NPC.
- Sequential creatures in one battle.
- Flag on win only.

Out:

- Prize money.
- More than six opposing creatures.

## Touch

- NPC event
- Battle state: opponent index
- Editor trainer fields

## Approach

- When the current opponent faints and another remains, the battle continues. The scene logs the send-out.
- Do not start a second `runBattle` per creature.

## Acceptance

- [ ] A test with two opposing creatures is not a win when the first faints.
- [ ] A test sets the flag only on full win.
- [ ] Manual trainer battle, then walk past them without a second fight.

## Test plan

- Domain battle test. Manual on the sample route. Update `docs/sample-town.md` if the walkthrough changes.
