---
id: T-046
title: Open a field start menu
status: done
priority: P1
phase: 6
type: feat
area: play
depends_on: [T-035]
blocks: [T-039, T-055]
---

# T-046 Open a field start menu

## Outcome

A key opens a menu with entries for Bag, Party, Save, and Close. Choosing an entry opens that screen or does nothing visible if its ticket is not done yet, except Close, which always works. Movement is paused while the menu is open.

## Why

Gate B's bag, party, and save need one shell. Building three unrelated keybinds would strand them.

## Scope

In:

- Menu state and drawing.
- Hooks the later tickets fill in.

Out:

- Pokédex, options screen, badges.

## Touch

- Play UI
- A small menu state module that is pure

## Approach

- The menu is a list of ids. Disabled entries still show, and choosing them closes nothing and opens nothing.
- Do not invent a second text renderer. Use the message module's text drawing if it can draw a string, or extract that.

## Acceptance

- [x] Open, move the highlight, close, and the player walks again.
- [x] Save is present. If T-041 is done it saves. If not, the entry is visible and inert.

## Test plan

- Unit test highlight movement. Manual key test.

## Result

- `engine/menu.ts`: `MENU_ENTRIES` (bag, party, save, close), `MenuState { highlight }`, `openMenu`, `moveMenu` (wraps at both ends), `selectedEntry`, `drawMenu(port, state, view, zoom, enabled)` — top-right panel through the message module's `DrawPort.fillText`, disabled entries greyed, ▶ on the highlight. No second text renderer.
- `engine/field.ts`: `FieldInput.menu` (edge), `FieldState.menu` and `menuChoice`. The menu opens only when standing with no message; while open movement is dropped, up/down move once per press, the interact key confirms into `menuChoice` (cleared next frame); Close or the menu key closes it. Bag, Party, and Save are visible and inert until T-039, T-055, and T-041 — `play.ts`'s `ENABLED_ENTRIES` says which open.
- Keys: Enter and Escape are Start; interact is now Z or Space (Enter moved off it).
- Tests: wrap and draw calls; the session opens, holds the player, moves, reports `save`, closes on Close and on the key, walks again; does not open over a message or mid-step. Verified in headless Chrome.
