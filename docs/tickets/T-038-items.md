---
id: T-038
title: Define items and pick them up once
status: ready
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

- [ ] Tests: first interact adds the item and the flag; second interact does not add it again.
- [ ] In play, the item message shows once and the object no longer draws.

## Test plan

- Domain tests. Manual pickup and reload before save exists: the flag persistence can wait for T-041, but the in-session behavior must hold.
