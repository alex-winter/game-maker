---
id: T-006
title: Make play mode a frame loop with the editor's draw order
status: ready
priority: P0
phase: 0
type: bug
area: play
depends_on: []
blocks: [T-017, T-030]
---

# T-006 Make play mode a frame loop with the editor's draw order

## Outcome

Holding an arrow pans the play view every frame at a steady speed. Releasing it stops. Play draws smaller `order` in front, the same rule as the editor. Resizing the window resizes the canvas.

## Why

`play.ts` defines `keys` and never reads it. `keydown` applies one step per event. The sort `(a, b) => b.order - a.order` draws the large order on top, which is the reverse of `z-index = 500 - order`. See docs/problems.md items 16 and 17.

## Scope

In:

- Key state is set on keydown and cleared on keyup, including when the window blurs.
- The animation frame reads that state and moves the camera.
- Arrow keys do not scroll the page.
- Draw order uses the same direction as the editor.
- The canvas matches the window on load and on resize.

Out:

- A walking player (T-026).
- Collision.
- Sharing the editor camera module. Play may keep its own loop until T-017, but the order comparison must be the named rule from T-005 if that ticket has landed, or a local function with the same contract if it has not.

## Touch

- `src/Client/play.ts`

## Approach

- One `requestAnimationFrame` loop. Clear, then draw. Do not schedule the next frame from inside `forEach`.
- Speed is pixels per second times the frame delta, not pixels per key event. 120 pixels per second is plenty for this debug camera.
- Sort placements by `-layer.order` before drawing so the first painted is the back.
- `imageSmoothingEnabled = false`.

## Acceptance

- [ ] Holding ArrowRight moves the view continuously. Releasing stops it within a frame.
- [ ] A layer with a lower `order` draws on top of a higher `order` in both editor and play, checked with two overlapping tiles.
- [ ] Resizing the browser does not leave a stretched buffer or a permanent uncleared border.

## Test plan

- Manual on `/play` after painting two overlapping layers. Hold each arrow. Resize.
