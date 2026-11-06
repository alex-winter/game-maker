---
id: T-055
title: Show the party screen
status: done
priority: P2
phase: 9
type: feat
area: play
depends_on: [T-046, T-047]
blocks: []
---

# T-055 Show the party screen

## Outcome

The start menu's Party entry lists the party: name, level, HP. The player can inspect one creature's moves. They cannot reorder in this ticket.

## Why

Gate B's party needs a screen.

## Scope

In:

- The screen.
- It reads the session party.

Out:

- Switching during battle. The battle scene may call this later; do not block on it.
- Summary pages for every stat.

## Touch

- Play UI

## Approach

- Draw in the field view. Pause the field session.

## Acceptance

- [x] A starter created by T-047 appears with the right level and HP.
- [x] Closing the screen returns to the field where the player stood.

## Test plan

- Manual from the start menu.

## Result

- `engine/party-screen.ts`: `PartyScreenState { highlight }`, `openPartyScreen`, `movePartyCursor`, `partyRow`, `drawPartyScreen` — list panel (cursor, name, level, HP bar, numbers; fainted greyed) and a detail panel with types, moves, experience.
- `FieldState.partyScreen` opens from the menu's Party entry (now enabled in `play.ts`), pauses the field like the bag, closes on either key back to the menu.
- Tests: field flow (open, cursor, pause, close back where the player stood), rows and drawing. Checked in Chrome: Enter → Party showed SPROUT Lv7 28/28 with TACKLE; Escape twice returned to a pixel-identical field frame.
