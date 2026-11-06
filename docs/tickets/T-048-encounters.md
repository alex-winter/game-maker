---
id: T-048
title: Start an encounter from grass
status: backlog
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

- [ ] A test with a fixed RNG returns the weighted species.
- [ ] A test with a weight of 0 never encounters.
- [ ] Stepping on grass in play produces the message and returns control afterward.

## Test plan

- Domain tests. Manual grass tile.
