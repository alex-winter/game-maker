---
id: T-010
title: Fix the canvas frame delay
status: ready
priority: P1
phase: 0
type: bug
area: editor
depends_on: []
blocks: []
---

# T-010 Fix the canvas frame delay

## Outcome

A canvas created with `fps: 60` waits about 16 milliseconds between frames, not 30. A missing fps uses 30 frames per second on purpose.

## Why

`Canvas2D` sets `this.msPerFrame = 1000 / this.parsedDataset.fps | 30`. Bitwise OR binds looser than division, so the value becomes `16 | 30`, which is 30. See docs/problems.md item 11.

## Scope

In:

- The delay is `Math.round(1000 / fps)` when fps is a positive finite number.
- Otherwise the delay is `Math.round(1000 / 30)`.

Out:

- Replacing `setTimeout` with a delta-time loop. T-017 owns the real loop. This ticket only stops the wrong delay.

## Touch

- `src/Client/Component/Canvas/Canvas.ts`
- A pure `frameDelayMs(fps: unknown): number` next to it, with a node test if T-011 has landed, otherwise a test file that will run once the runner exists.

## Approach

- Do not keep the `|` operator. Write the default as an explicit branch.
- Add the test cases: 60 → 17 (rounded) or 16 if you floor, missing → 33-ish, 0 → the default, a non-number → the default. Pick `Math.round` and lock it in the test.

## Acceptance

- [ ] `frameDelayMs(60)` is 17.
- [ ] `frameDelayMs(undefined)` and `frameDelayMs(0)` are 33.
- [ ] The canvas uses that function.

## Test plan

- Unit test the pure function. The runner arrives in T-011; if this ticket lands first, leave the test file and note that in the commit.
