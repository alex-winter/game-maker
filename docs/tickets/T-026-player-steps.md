---
id: T-026
title: Step the player from cell to cell
status: backlog
priority: P1
phase: 3
type: feat
area: engine
depends_on: [T-014, T-020]
blocks: [T-027, T-028, T-029, T-030, T-032, T-034]
---

# T-026 Step the player from cell to cell

## Outcome

The play session has a player at a cell, facing up, down, left, or right. Holding a direction moves them one cell at a time at a walk speed and a faster run speed. They cannot leave the map.

## Why

Gen 3 movement is a step, not a free camera. The camera debug in T-006 is not the game.

## Scope

In:

- A pure `beginStep` / `advanceStep` that uses time.
- Walk and run speeds expressed as milliseconds per cell.
- Facing changes immediately when a new direction is pressed, even if a step cannot start.
- A spawn cell stored on the map.

Out:

- Collision other than the map bounds (T-028).
- Sprites (T-027). A rectangle is fine.
- Animation frames.

## Touch

- `src/engine/player.ts` or `src/domain/movement.ts`
- Play host input.

## Approach

- Input is a set of held directions, same idea as T-006, passed into the session. The domain does not listen to the keyboard.
- A step in progress finishes before another begins. Queue at most the latest held direction.
- Pixel position during a step is `from + (to - from) * t`.

## Acceptance

- [ ] Tests: a step takes the authored duration; a second press during a step does not teleport; the player stops on the last in-bounds cell.
- [ ] In play, holding a key walks cell to cell, and holding the run modifier crosses a cell faster.

## Test plan

- Domain tests with a fake clock. Manual play on a painted map.
