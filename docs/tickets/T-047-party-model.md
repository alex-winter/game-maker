---
id: T-047
title: Model a party of creatures
status: done
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

- [x] A test party rejects a seventh creature.
- [x] New game starts with the authored starter at the authored level and full HP.
- [x] Species survive reload of the project.

## Test plan

- Domain tests. Manual new game.

## Result

- `domain/creature.ts`: `Species { id, name, types, baseStats, learnset }`, the minimal `Move { id, name, power, accuracy, type }` T-052 extends, `Creature { speciesId, level, hp, experience, moves }`, `Party` with `MAX_PARTY` 6 and `MAX_MOVES` 4, `Starter { speciesId, level }`. Pure functions: `newCreature` (full HP, learnset moves at or below the level, last four), `addToParty` (undefined on the seventh), `isFainted`, `hasAbleCreature`, `damaged`, `healed`, `movesAtLevel`, `starterParty`. Our own plain rules, written in the tests: `statAt = floor(base × level / 50) + 5`, `maxHpAt = statAt(hp) + level + 10`, `experienceForLevel = level³`. Validators `isSpeciesInput`, `isMoveInput`, `isStarter`, `isParty`. No natures, EVs, IVs, abilities, or held items.
- Project: `species`, `moves`, `starter` with find/add/with/remove helpers (`removeSpecies` clears a starter of it; `removeMove` drops it from every learnset) and `withStarter`; `withProjectDefaults` fills them. Routes `POST/PUT/DELETE /project/species`, `/project/moves`, `PUT /project/starter`; `ProjectRepository` wrappers.
- Session: `FieldState.party`; `newField(..., party)`, `starterParty` at new game in `play.ts`, `snapshotField`/`restoreField` carry it, `SavedSession.party` (version stays 1; an older save without one resumes with nobody).
- Editor: `SpeciesEditor` (paw button) — species select, + Species, Delete; name, one or two types, six stats; learnset rows (level, move) with add/remove; the move catalog (name, power, accuracy, type) with add/delete; and "A new game starts with … at level …".
- Tests: a new creature at the authored level with full HP and threshold experience; the move list keeps the last four and dedupes; level clamping; a party refuses the seventh; damage floors at zero and healing restores; a missing starter species gives an empty party; validators; a save without a party parses; the field session carries the starter through a snapshot.
- Verified in headless Chrome: Tackle and Sprout created through the editor, type and HP edited, a learnset row added, the starter set to Sprout at level 7; all survive a reload; a new game saved from the start menu holds Sprout at level 7 with 28 HP (the rule's max) and Tackle.
