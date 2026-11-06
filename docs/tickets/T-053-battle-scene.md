---
id: T-053
title: Resolve a single-creature battle
status: done
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

- [x] A test where a high-power move faints the opponent produces a win.
- [x] A test where accuracy is 0 never deals damage.
- [x] A faster opponent acts first.
- [x] Manual: the scene appears from the grass placeholder once T-056 lands. Until then a debug entry can start a battle.

## Test plan

- Domain tests with a fixed RNG. Manual scene.

## Result

- `domain/battle.ts`: `Combatant`, `BattleState`, `BattleChoice`, `newBattle`, `battleStep` (one whole turn: run, speed order, accuracy, damage, faint, outcome), `damageDealt` with the formula documented in the module and worked by hand in the test (STAB ×1.5 included and tested; power 0 refused; immune 0; min 1), `hits`, `damageRoll`, `playerFirst`, `foeChoice`, `playerMoves`, `battleResult`.
- `engine/battle-scene.ts`: panels intro → main (FIGHT/RUN) → moves → log → done; `drawBattleScene` with status panels, HP bars, stand-in rectangles (species have no pictures yet), and the message box carrying the menu as choices.
- `play.ts` opens the scene for any `FieldState.battle` — grass and trainers alike — and falls back to the placeholder only when `newBattle` cannot open (unknown species, nobody standing); `afterBattle(…, shown)` then tells only the ending. No debug entry was needed: a trainer walk-up or grass step starts it.
- Tests: formula values, accuracy 0 never damages, high-power move wins, faster opponent first (and a tie goes to the player), trading blows, running wild vs trainer, newBattle refusals; scene flow and drawing. Checked in Chrome: Ace walked up, the scene opened, FIGHT → TACKLE through four turns, the HP bars fell, the scene closed on “You won!”, the flag and `battles-won` 1 and the party's 22/28 HP were in the save.
