---
id: T-039
title: Open a bag from the field
status: done
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

- [x] Picking up two of the same item shows quantity 2.
- [x] Opening the bag pauses movement.

## Test plan

- Unit test `addItem`. Manual from the start menu.

## Result

- `engine/bag-screen.ts`: `BagScreenState { highlight }`, `openBagScreen`, `moveBagCursor` (clamped, 0 for an empty bag), `firstVisibleRow` (scrolls `BAG_ROWS` = 7 at a time), `drawBagScreen(port, bag, itemOf, state, view, zoom)` — list panel with `▶`, `NAME ×count`, "Nothing in the bag." when empty, and a description panel for the highlighted stack. Same `fillText` renderer as the message box.
- The bag functions landed with T-038 as `addToBag` / `bagCount` (the ticket's `addItem` / `quantity`); `addToBag` stacks by item id.
- `engine/field.ts`: `FieldState.bagScreen`; choosing Bag in the menu opens it over the menu, movement is dropped, up/down move the cursor, the menu key (or interact) steps back to the menu. `FieldWorld.itemNameOf` became `itemOf` (name and description).
- Tests: cursor, scrolling, draw calls; the session opens the bag from the menu with two stacks, holds the player, moves, steps back. Verified in headless Chrome: two potions picked up show `POTION ×2`, a held direction does nothing, closing resumes walking.
