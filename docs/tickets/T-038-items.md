---
id: T-038
title: Define items and pick them up once
status: done
priority: P1
phase: 6
type: feat
area: domain
depends_on: [T-034, T-040]
blocks: [T-039, T-051]
---

# T-038 Define items and pick them up once

## Outcome

The author defines an item (id, name, description) and places it on a cell. Interacting adds it to the bag and sets a flag so it is gone. The object is hidden when the flag is set.

## Why

Finding an item, and not finding it again, is part of Gate A.

## Scope

In:

- Item catalog on the project.
- Item event on a map: cell, item id, flag id.
- Pickup behavior in the session.
- A message naming the item, using T-035.

Out:

- The bag screen layout beyond 'the item is in the data' if T-039 is not done. This ticket updates the bag data either way.
- Hidden items that require an itemfinder.

## Touch

- `src/domain/item.ts`
- Map events
- Editor forms
- Play session

## Approach

- Pickup is a function `(bag, flags, event) => { bag, flags, alreadyTaken }`. Test both branches.
- The picture is a metatile the author chooses. The event is what makes it an item.

## Acceptance

- [x] Tests: first interact adds the item and the flag; second interact does not add it again.
- [x] In play, the item message shows once and the object no longer draws.

## Test plan

- Domain tests. Manual pickup and reload before save exists: the flag persistence can wait for T-041, but the in-session behavior must hold.

## Result

- `domain/item.ts`: `Item { id, name, description }`, `Bag`/`BagEntry` with `addToBag`/`bagCount`, `isTaken(event, memory)`, `pickUp(bag, memory, event) → { bag, memory, alreadyTaken }`, `isItemInput`, `isBag`. `ItemEvent` gained `flagId` and `metatileId | null`; `newItemEvent`; `isMapEvents` checks both.
- Project `items: Item[]` with helpers and defaults; routes `POST/PUT/DELETE /project/items[/:itemId]`; `projectRepository.createItem/saveItem/deleteItem`.
- Session (`engine/field.ts`): `FieldState.bag`, `FieldWorld.itemNameOf`, `visibleEvents` (taken items are not there), `itemsOnMap`, items block the step; the interact key picks one up once and shows `You found a POTION!`. `engine/item-actor.ts` draws the chosen metatile on the cell until then; `play.ts` passes those actors with the player.
- Editor: `ItemsEditor` window (side menu box button) for the catalog; `EventKindPicker` offers Item; `ItemForm` picks item, flag (with “+ New flag” suggesting “Took <item> at x, y”), and metatile with a preview.
- Tests: first pickup adds and flags, second does not; bag stacking; the session blocks, picks up once, hides, and opens the cell. Verified in headless Chrome: catalog → placed event → play shows the message once, the object stops drawing, the cell becomes walkable.
