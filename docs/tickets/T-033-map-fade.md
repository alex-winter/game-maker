---
id: T-033
title: Fade between maps
status: done
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

- [x] A test advances the clock and sees the session refuse input mid-fade and accept it after.
- [x] Manual door entry shows a visible fade and lands on the right cell.

## Test plan

- Session test with a fake clock. Manual play.

## Result

- `engine/fade.ts`: `Fade { phase: out | in, elapsedMs, durationMs }`, `startFade`, `advanceFade` (reports `swap` on the black frame), `fadeOpacity`, `FADE_MS` = 200 per half.
- `engine/field.ts`: the session the ticket asked for — `FieldState`, `FieldWorld`, `newField`, `advanceField`, `isTransitioning`. Both transition kinds (warp, seam) set a pending `Transition` and fade; the player is frozen and input dropped until the fade-in ends. The play host now just calls `advanceField`, swaps scenes when `mapId` changes, and paints the darkness.
- Fixed on the way: a held key chained the next step on the same frame a step finished, so `after.step` was never null and warps/seams were missed; `stepFinished(before, after)` (cell equals the previous step's target) replaces that check in `warpTaken` and the seam test.
- Tests: fake-clock session tests — door step → fade → swap at black → lands on the warp cell facing up; input refused mid-fade and accepted after; seam crossing fades and applies the offset; arriving on a warp does not re-fire.
- Verified in headless Chrome: brightness drops mid-fade, the player stands frozen on the door, the house fades in, facing up.
