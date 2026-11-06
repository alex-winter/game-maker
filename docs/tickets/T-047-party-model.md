---
id: T-047
title: Model a party of creatures
status: ready
priority: P1
phase: 8
type: feat
area: domain
depends_on: [T-012]
blocks: [T-048, T-052, T-055]
---

# T-047 Model a party of creatures

## Outcome

The project defines species (id, name, base stats, types, level-up moves). A play session has a party of up to six creatures with species, level, current HP, and moves. This ticket does not fight.

## Why

Gate B and Gate C must share this model. A throwaway 'wild battle won' boolean would have to be deleted.

## Scope

In:

- Species and creature types.
- Pure functions: add to party, faint check, experience threshold table left simple and explicit.
- Editor UI to define a species and a starter placed in the new-game party.

Out:

- Battle (phase 9).
- The party screen (T-055).
- Natures, EVs, IVs, abilities, held items. Leave the type open to those fields only if they can default and stay unused. Prefer omitting them.

## Touch

- `src/domain/creature.ts`
- Project and new-game session
- Editor species form

## Approach

- Stats are numbers the author enters. Do not import a formula from a real game.
- A creature's moves are ids. The move catalog arrives in T-052. Until then a move is `{ id, name, power, accuracy, type }` stored on the species learnset in a minimal form this ticket owns, and T-052 extends it rather than replacing the id.

## Acceptance

- [ ] A test party rejects a seventh creature.
- [ ] New game starts with the authored starter at the authored level and full HP.
- [ ] Species survive reload of the project.

## Test plan

- Domain tests. Manual new game.
