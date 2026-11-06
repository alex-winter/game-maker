---
id: T-042
title: Place NPC object events
status: done
priority: P1
phase: 7
type: feat
area: editor
depends_on: [T-027, T-036]
blocks: [T-043, T-044]
---

# T-042 Place NPC object events

## Outcome

The author places an NPC on a cell with a sprite definition, a facing, and a dialog id. The editor shows them. Play draws them.

## Why

People are object events, not tiles, so they can face and move.

## Scope

In:

- NPC event type.
- Editor place, move, and delete.
- Render in both hosts.

Out:

- Movement behaviors (T-044).
- Conversation wiring beyond storing the dialog id (T-043 connects interact).

## Touch

- Domain event type
- Editor
- Engine actor draw

## Approach

- Reuse the sprite definition from T-027. An NPC without a sprite still has a cell and draws a fallback rectangle so data can be tested.

## Acceptance

- [x] Place an NPC, reload, they are on the same cell in the editor and in play.
- [x] Deleting them removes the event.

## Test plan

- Manual place and reload. A domain test that a map reports the NPC at that cell.

## Result

- `NpcEvent { kind: 'npc', id, cell, name, spriteId | null, facing, dialogId | null }` replaces the `npcId` placeholder; `newNpcEvent`, `npcsOn(events)`, validated by `isMapEvents`. The interact resolver's NPC answer now carries `eventId` and `dialogId` for T-043.
- `engine/npc-actor.ts`: `npcActor(npc, facing, lookup)` — the sprite's idle pose for the facing (T-027's `pickFrame`), standing on the cell like the player, or a blue stand-in cell. Drawn by the editor (`MapCanvas.npcActors`, through `projectRepository.cachedProject`) and by play; people block the step in the field session.
- Editor: `EventKindPicker` offers Person; `NpcForm` (name, sprite select with a stand-in option, facing, dialog or "nothing to say yet", Delete). Moving is edit-the-cell: `withEvent` replaces by id.
- Tests: validator and `npcsOn` (a map reports the person at a cell; replacing does not clone), actor placement and fallback, the session blocks on a person. Verified in headless Chrome: Mom placed at (8,10) facing right with the Hero sprite and a dialog; after reload the event is unchanged, the editor and play both draw the right-facing head, the player cannot walk into her, and Delete removes the event.
