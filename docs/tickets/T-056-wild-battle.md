---
id: T-056
title: Run wild encounters through the battle scene
status: done
priority: P1
phase: 9
type: feat
area: engine
depends_on: [T-048, T-053]
blocks: []
---

# T-056 Run wild encounters through the battle scene

## Outcome

Grass encounters call the real `runBattle`. A win returns to the field with the battle's party changes. A loss restores the party HP to the pre-battle snapshot and returns the player to the last heal point, or to the spawn if none was set.

## Why

The placeholder from T-048 has to be replaced, not wrapped in more flags.

## Scope

In:

- Wire the implementation.
- A heal point event the author can place.
- Remove the placeholder implementation.

Out:

- Blackout money.
- Safari balls.

## Touch

- Play session
- Map event for a heal point

## Approach

- Snapshot the party when the battle starts. Loss restores that snapshot's HP values and the position.
- Win keeps the mutated party from the battle result.

## Acceptance

- [x] Manual: win a wild battle, see HP change persist in the party screen.
- [x] Manual: lose, appear at the heal point with the pre-battle HP.
- [x] No placeholder message remains as the only result.

## Test plan

- A session test with a scripted battle result for win and loss. Manual grass.

## Result

- `HealEvent { kind: 'heal' }` in `domain/warp.ts`; the event picker places it at once (red H marker), the rubber removes it. Interacting refills the party by species and sets `FieldState.healPoint` where the player stood; the save keeps it (`SavedSession.healPoint`, null for older saves).
- `afterBattle(state, result, world)`: a loss restores the request's pre-battle party and sets `retreat`; when the box's last page closes the field fades to the heal point or `FieldWorld.home` (the start map's spawn). Win and flight keep the battle's party.
- `engine/battle-placeholder.ts` and `BattleRunner` are gone; a request whose species is missing is dropped by `dismissBattle` with a word.
- Tests: heal, loss retreat to heal point and to home, dismissal. Checked in Chrome: healed at a bed, lost to a Lv40 trainer, woke at the bed with 28/28 HP, flag clear.
