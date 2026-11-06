---
id: T-039
title: Open a bag from the field
status: backlog
priority: P1
phase: 6
type: feat
area: play
depends_on: [T-038, T-046]
blocks: [T-051]
---

# T-039 Open a bag from the field

## Outcome

The start menu opens a bag that lists the items the player holds, with their names and quantities.

## Why

An item that exists only as a flag is not a bag.

## Scope

In:

- Bag view in the play UI.
- Quantities stack for the same item id.

Out:

- Using an item, tossing, or pockets beyond a single list. Key items and regular items can share the list until a ticket splits them.

## Touch

- Play UI
- Domain bag functions: `addItem`, `quantity`

## Approach

- The bag is `{ itemId, quantity }[]`. `addItem` increments.
- Draw it in the same 240×160 view as the message box.

## Acceptance

- [ ] Picking up two of the same item shows quantity 2.
- [ ] Opening the bag pauses movement.

## Test plan

- Unit test `addItem`. Manual from the start menu.
