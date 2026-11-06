---
id: T-042
title: Place NPC object events
status: ready
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

- [ ] Place an NPC, reload, they are on the same cell in the editor and in play.
- [ ] Deleting them removes the event.

## Test plan

- Manual place and reload. A domain test that a map reports the NPC at that cell.
