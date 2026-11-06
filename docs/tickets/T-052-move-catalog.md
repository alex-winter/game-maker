---
id: T-052
title: Define moves and a type chart
status: done
priority: P1
phase: 9
type: feat
area: domain
depends_on: [T-047]
blocks: [T-053]
---

# T-052 Define moves and a type chart

## Outcome

Moves have power, accuracy, type, and a damage class of physical or special. A type chart returns a multiplier. Both are data the editor can change, with tests for a few matchups.

## Why

Battle math needs a catalog that is not hardcoded inside the damage function.

## Scope

In:

- Move and type types.
- Chart as data.
- Editor forms.
- Extend the move id from T-047 rather than inventing a second move type.

Out:

- Status moves, priority, and multi-hit. A status move can exist with power 0 and be rejected by the damage function until a later ticket.

## Touch

- `src/domain/battle-data.ts`
- Editor

## Approach

- Multiplier is a number: 0, 0.5, 1, 2. Test 0.
- The chart is a map keyed by attacking type then defending type.

## Acceptance

- [x] Tests for super effective, resisted, immune, and missing entry (missing means 1).
- [x] A move authored in the editor reloads.

## Test plan

- Domain tests.

## Result

- `Move.damageClass: 'physical' | 'special'` extends T-047's record in place; `newMove` takes it, `isMoveInput` accepts it missing, `withMoveDefaults` (in `withProjectDefaults` and the server's `cleanedMove`) reads older moves as physical.
- `domain/battle-data.ts`: `TypeChart` keyed attacking → defending → multiplier from `MULTIPLIERS` 0, 0.5, 1, 2; `matchup` (missing = 1), `effectiveness` across one or two defending types, `withMatchup` (×1 removes the entry and an emptied row), `chartTypes`, `isTypeChart`. `Project.typeChart` with `withTypeChart`, `typeNames(project)`.
- `PUT /project/type-chart`; `projectRepository.saveTypeChart`.
- Species editor: a class select per move row; a **Type chart** grid of selects (attacking down, defending across, coloured by multiplier) and “+ Type”.
- Tests: super effective, resisted, immune, missing attacking and defending entries, two-type products, set/remove, validation, defaults. Checked in Chrome: authored “Ember” fire/special through the editor, set fire→grass ×2 and grass→fire ×½ in the grid, reloaded the page — the class and both matchups came back; a cell the chart does not mention shows ×1.
