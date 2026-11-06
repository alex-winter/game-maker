---
id: T-025
title: Create, rename, resize, and delete maps
status: ready
priority: P1
phase: 2
type: feat
area: editor
depends_on: [T-013]
blocks: [T-031, T-032]
---

# T-025 Create, rename, resize, and delete maps

## Outcome

The editor lists every map in the project and can add, rename, resize, and delete one. Resize keeps the overlapping cells and fills new cells with empty.

## Why

A town and its houses are separate maps. T-013 stores them; this ticket makes them operable.

## Scope

In:

- List UI and the four operations.
- Delete asks for a confirmation in the existing modal.
- The active map is obvious.

Out:

- Connections between maps (T-031).
- Duplicating a map. Add it only if it falls out of the same functions.

## Touch

- Editor map list.
- Domain `resizeGrid` pure function.
- Server project routes from T-013.

## Approach

- `resizeGrid` is pure and tested: shrinking clips, growing pads with 0.
- Deleting the active map selects another, or an empty state if none remain.

## Acceptance

- [ ] Two maps can be created, named, and switched.
- [ ] Resize from 10×10 to 12×8 keeps the top-left 10×8 and drops the rest.
- [ ] Delete removes the map from the project file.

## Test plan

- Unit test `resizeGrid`. Manual create, rename, switch, delete.
