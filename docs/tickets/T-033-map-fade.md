---
id: T-033
title: Fade between maps
status: backlog
priority: P2
phase: 4
type: feat
area: engine
depends_on: [T-030, T-031, T-032]
blocks: []
---

# T-033 Fade between maps

## Outcome

A connection or a warp fades the view out, swaps the map, and fades in. Input is ignored during the fade.

## Why

A hard pop makes doors feel broken even when the data is right.

## Scope

In:

- A fade state in the session, driven by time.
- Both transition kinds use it.

Out:

- Special transition styles (flash, pixelate).

## Touch

- Engine session
- Play host draw: a full-view rect over the scaled buffer

## Approach

- The fade is a value from 0 to 1. The session does not advance the player while it is running.
- Keep it in the engine so the editor's preview can call it later. The editor does not need a preview in this ticket.

## Acceptance

- [ ] A test advances the clock and sees the session refuse input mid-fade and accept it after.
- [ ] Manual door entry shows a visible fade and lands on the right cell.

## Test plan

- Session test with a fake clock. Manual play.
