---
id: T-057
title: Run trainer battles through the battle scene
status: done
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

- [x] A test with two opposing creatures is not a win when the first faints.
- [x] A test sets the flag only on full win.
- [x] Manual trainer battle, then walk past them without a second fight.

## Test plan

- Domain battle test. Manual on the sample route. Update `docs/sample-town.md` if the walkthrough changes.

## Result

- `Opponent { speciesId, level }` in `domain/encounter.ts`; `BattleRequest.opponents` replaces `speciesId`/`level` (the grass sends one). `Trainer.party: Opponent[]` (≤ 6); `withEventDefaults` migrates a T-049 trainer's single creature.
- `BattleState.opponents`/`foeIndex`/`trainerName`; `settle` pays experience and sends out the next creature (`ACE sent out SLUG!`) instead of winning while one remains. `BattleData.species` resolves the send-out. One scene per trainer, never one per creature.
- `NpcForm` shows the party as rows (species, level, ×) with “+ Creature”.
- Tests: two-creature battle not won at the first faint, both faints paid, missing second species ends at the first; legacy trainer migration; field hands both opponents and sets the flag on a full win only. Checked in Chrome: a Lv2+Lv3 trainer, 32 presses through both send-outs, 403 exp, flag set, walked back through the sight line with no second fight. T-051 was not yet built, so `docs/sample-town.md` does not exist to update.
