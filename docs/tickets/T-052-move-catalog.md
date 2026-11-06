---
id: T-052
title: Define moves and a type chart
status: backlog
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

- [ ] Tests for super effective, resisted, immune, and missing entry (missing means 1).
- [ ] A move authored in the editor reloads.

## Test plan

- Domain tests.
