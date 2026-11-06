---
id: T-048
title: Start an encounter from grass
status: done
priority: P1
phase: 8
type: feat
area: domain
depends_on: [T-047]
blocks: [T-049, T-056]
---

# T-048 Start an encounter from grass

## Outcome

A cell can be marked as grass with an encounter table (species id, level range, weight). After a step onto it, a pure roll can return an encounter. Play shows a 'a wild X appeared' message and a win/lose placeholder that does not change the party except through the battle seam.

## Why

Gate B needs grass that starts an encounter. The placeholder must call the same function Gate C's battle will, so the map data stays.

## Scope

In:

- Encounter table on the map or on a terrain tag.
- Roll function that takes an RNG.
- A `BattleRequest` object: player party, opponent species, level.
- A placeholder handler that records the request. Winning and losing can set a flag until T-056 replaces the handler.

Out:

- The battle scene (T-053, T-056).
- Fishing.

## Touch

- `src/domain/encounter.ts`
- Map attributes
- Play session

## Approach

- The roll returns `BattleRequest | null`. Null means no encounter.
- The session depends on an interface `runBattle(request) => result`. The placeholder implements it. T-056 provides the real one. Do not branch on a boolean `useRealBattle` sprinkled through walk code.

## Acceptance

- [x] A test with a fixed RNG returns the weighted species.
- [x] A test with a weight of 0 never encounters.
- [x] Stepping on grass in play produces the message and returns control afterward.

## Test plan

- Domain tests. Manual grass tile.

## Result

- `TileMap.attributes.grass: number[]` (T-022's shape; `withTileMapDefaults` fills it for older files, `resizeTileMap` re-lays it, `isTileMap` checks it); `isGrassAt`, `withGrass`, `CellAttributes.grass`. The layer listing has a green **Grass** paint row with its own overlay; pencil, rectangle, fill, and rubber write it like collision.
- `domain/encounter.ts`: `EncounterEntry { speciesId, minLevel, maxLevel, weight }`, `EncounterTable { rate, entries }` on every `GameMap` (`emptyEncounterTable` default, `withMapEncounters`, `PUT /project/maps/:mapId/encounters`), `pickEntry` (weighted; a weight of 0 is never picked), `rollEncounter(table, party, random) → BattleRequest | null`, `wildAppearedText`. The `BattleRequest`, `BattleResult`, and `BattleRunner` seam live here; `engine/battle-placeholder.ts` is the runner until T-056. `Random` moved to `domain/random.ts`.
- Field: a step that finishes in grass rolls on the map's table; a hit stops the player and sets `FieldState.battle`; `play.ts` runs it through the runner the same frame and `afterBattle` opens "A wild X appeared!" then the outcome, takes the party the battle left, and counts a win in `battles-won`. Nothing on the walk path branches on which runner is installed.
- Editor: `EncounterForm` from the map select's seedling button — rate, a line per species (min, max, weight), add/remove.
- Tests: a fixed RNG returns the weighted species and a level in range across every line; the rate gates at exactly the threshold; a weight of 0 never encounters, alone or beside others; the message; the table validator; the field hands over a request from grass and stops, `afterBattle` tells the story, a quiet table and plain ground roll nothing.
- Verified in headless Chrome: the table authored through the form (rate 100, Sprout 3–3), grass painted west of the spawn, one step in play opens "A wild SPROUT appeared!" then the placeholder's "You won!", and the box closes to the field.
