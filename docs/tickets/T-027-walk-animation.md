---
id: T-027
title: Animate the player in four directions
status: done
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

- [x] A test with two walk frames picks the first for phase 0.2 and the second for phase 0.7.
- [x] In play, walking left shows the left cycle, and standing shows the left idle.

## Test plan

- Unit test frame selection. Manual walk in four directions.

## Result

- `domain/sprite.ts`: `SpriteDefinition` (sheet, frame size, per-direction `idle` + `walk[]` rectangles), `pickFrame` (pure: definition, direction, phase, idle), `withFrame`/`withoutWalkFrame`, `isSpriteDefinitionInput`. `Project.sprites[]` and `Project.playerSpriteId` with `addSprite`/`withSprite`/`removeSprite`/`withPlayerSprite`/`playerSprite`.
- `engine/player-actor.ts` maps a `Player` to the `Actor` the shared render draws; the sprite stands on its cell (a 16×32 frame overhangs upward). No sprite → the red cell stays.
- Routes: `POST/PUT/DELETE /project/sprites`, `PUT /project/player-sprite`.
- `SpriteEditor` window (side menu walking-figure button): create/rename/delete sprites, choose sheet and frame size, select a slot and click the sheet grid to assign, remove walk frames, live walk preview, "Use as player". Every change saves.
- Deleted `AnimationMaker`, `SpriteModelMaker`, `Canvas2D`, `Model/SpriteModel.ts`, `Model/AnimatedSprite.ts`, the `/sprite-model` route and its data file config.
- Tests: phase 0.2 → first of two frames, 0.7 → second; idle and empty-cycle fall back; replace/append/remove; input validation; actor placement. Verified in headless Chrome: authored a 4×3 test sheet through the UI, assigned it to the player, and saw the left walk cycle while stepping left and the left idle when standing.
