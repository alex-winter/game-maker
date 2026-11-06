---
id: T-041
title: Save and load a play session
status: backlog
priority: P1
phase: 6
type: feat
area: play
depends_on: [T-030, T-040]
blocks: [T-051]
---

# T-041 Save and load a play session

## Outcome

The player can save from the field menu and load that save from play boot. The save stores map id, cell, facing, flags, variables, and bag. It does not store the whole map.

## Why

Gate A says the world remembers. Reloading the page is the test.

## Scope

In:

- Save document type and a version field.
- Write and read through the server, one slot.
- Load on boot if a save exists, with a way to start a new game.

Out:

- Multiple slots. Structure the file so a later ticket can add them (`slots: []` is fine).
- Migrating old saves. Version 1 only.

## Touch

- `src/domain/save.ts` pure serialize/parse
- Server route
- Play boot and the menu entry from T-046. If T-046 is not done, a temporary key can save, and T-046 moves it into the menu.

## Approach

- Parse validates the version and the shape and returns a result, never a partial session.
- Atomic write from T-016.

## Acceptance

- [ ] A test round-trips a session through serialize and parse.
- [ ] Manual: pick up an item, walk into the house, save, reload the browser, load, and find the same cell, the item gone, and the bag intact.

## Test plan

- Domain round-trip test. The manual script above.
