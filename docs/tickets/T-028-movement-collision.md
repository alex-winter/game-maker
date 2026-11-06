---
id: T-028
title: Block steps into solid cells
status: backlog
priority: P1
phase: 3
type: feat
area: domain
depends_on: [T-022, T-026]
blocks: [T-044, T-050]
---

# T-028 Block steps into solid cells

## Outcome

The player does not enter a solid cell or a cell of a different elevation. A ledge attribute blocks the matching approach and allows the opposite approach.

## Why

Walls, water, and ledges are the map. Without them a town is a picture.

## Scope

In:

- `canStep(map, from, to)` in the domain.
- The player session asks it before `beginStep`.
- Tests for solid, elevation, each ledge direction, and the map edge.

Out:

- NPC blocking (T-044).
- Surf and other field moves (T-050).

## Touch

- `src/domain` movement or collision module
- Player session from T-026

## Approach

- Elevation blocks when the absolute difference is greater than 0, except where a ledge explicitly allows the downward direction. Document that rule in the test names.
- A refused step still updates facing.

## Acceptance

- [ ] Tests cover each ledge direction and a flat solid wall.
- [ ] In play, the player slides along a wall instead of entering it, and can hop a ledge only one way.

## Test plan

- Domain tests. Manual wall and ledge on a sample map.
