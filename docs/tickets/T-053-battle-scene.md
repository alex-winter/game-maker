---
id: T-053
title: Resolve a single-creature battle
status: backlog
priority: P1
phase: 9
type: feat
area: engine
depends_on: [T-052]
blocks: [T-054, T-056, T-057]
---

# T-053 Resolve a single-creature battle

## Outcome

Given a `BattleRequest` and choices of moves, a pure battle step applies accuracy, damage, and fainting for one creature on each side. A play scene shows both and asks the player to pick a move.

## Why

This is the Gate C core. Field code talks to it only through `runBattle`.

## Scope

In:

- Damage function with level, power, attack, defense, and type multiplier. Document the formula in the test.
- Turn order by a speed stat.
- The scene's input and drawing inside the 240×160 view.
- A result: win, loss, or run.

Out:

- Experience (T-054).
- Switching, items, status ailments, critical hits, STAB if not in the formula. If you include STAB, test it. Do not include untested factors.
- Doubles.

## Touch

- `src/domain/battle.ts`
- Play battle scene
- The `runBattle` interface from T-048

## Approach

- The step function takes the battle state and a choice and returns the next state plus log lines. The scene draws the log.
- RNG is an argument.

## Acceptance

- [ ] A test where a high-power move faints the opponent produces a win.
- [ ] A test where accuracy is 0 never deals damage.
- [ ] A faster opponent acts first.
- [ ] Manual: the scene appears from the grass placeholder once T-056 lands. Until then a debug entry can start a battle.

## Test plan

- Domain tests with a fixed RNG. Manual scene.
