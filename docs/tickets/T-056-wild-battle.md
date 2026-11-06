---
id: T-056
title: Run wild encounters through the battle scene
status: backlog
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

- [ ] Manual: win a wild battle, see HP change persist in the party screen.
- [ ] Manual: lose, appear at the heal point with the pre-battle HP.
- [ ] No placeholder message remains as the only result.

## Test plan

- A session test with a scripted battle result for win and loss. Manual grass.
