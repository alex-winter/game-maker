---
id: T-046
title: Open a field start menu
status: ready
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

- [ ] Open, move the highlight, close, and the player walks again.
- [ ] Save is present. If T-041 is done it saves. If not, the entry is visible and inert.

## Test plan

- Unit test highlight movement. Manual key test.
