---
id: T-054
title: Award experience and levels
status: ready
priority: P2
phase: 9
type: feat
area: domain
depends_on: [T-053]
blocks: []
---

# T-054 Award experience and levels

## Outcome

Winning a battle grants experience to the player's creature. Enough experience raises the level by one and refills HP. The learnset can add a move at that level if there is a free move slot.

## Why

A party that never changes is not a field RPG.

## Scope

In:

- An explicit experience curve function, simple and tested.
- Level-up applied to the creature.
- A message in the battle scene.

Out:

- Evolution.
- EV yield.
- Learning when the move list is full, beyond 'skip and say so'.

## Touch

- Domain creature functions
- Battle result application

## Approach

- Curve: experience to reach level n is `n * n * n`. Write that down in the test and do not tune it to match a real game.

## Acceptance

- [ ] A test creature levels from 5 to 6 at the threshold and not one point below.
- [ ] A move on the learnset at that level is added when a slot is free.

## Test plan

- Domain tests.
