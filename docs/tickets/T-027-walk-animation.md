---
id: T-027
title: Animate the player in four directions
status: backlog
priority: P1
phase: 3
type: feat
area: engine
depends_on: [T-026]
blocks: [T-042, T-051]
---

# T-027 Animate the player in four directions

## Outcome

The player sprite shows an idle pose per direction and a walk cycle while stepping. Frames come from a sheet the author assigns.

## Why

`AnimatedSprite.ts` is a sketch nothing reads. Gate A needs a walking character, not a blue circle.

## Scope

In:

- A sprite definition: for each direction, an idle frame and a list of walk frames, each a rectangle on a sheet.
- The engine picks the frame from direction and step progress.
- An authoring UI sufficient to assign those rectangles. This replaces the empty `AnimationMaker` and the unwired `SpriteModelMaker`; delete them or make them the UI, do not leave both.

Out:

- NPC sprites beyond reusing the same definition type (placement is T-042).
- Smooth sub-frame pixel art blending.

## Touch

- `src/domain/sprite.ts`
- Engine render of the actor
- Editor assignment UI

## Approach

- Frame selection is a pure function of definition, direction, phase in `[0,1]`, and whether the actor is idle.
- Render through the draw port from T-017, between ground and overhead (T-023).

## Acceptance

- [ ] A test with two walk frames picks the first for phase 0.2 and the second for phase 0.7.
- [ ] In play, walking left shows the left cycle, and standing shows the left idle.

## Test plan

- Unit test frame selection. Manual walk in four directions.
