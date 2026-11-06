---
id: T-055
title: Show the party screen
status: backlog
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

- [ ] A starter created by T-047 appears with the right level and HP.
- [ ] Closing the screen returns to the field where the player stood.

## Test plan

- Manual from the start menu.
