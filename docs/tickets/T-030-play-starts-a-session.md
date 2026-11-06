---
id: T-030
title: Start play mode from a chosen map
status: ready
priority: P1
phase: 3
type: feat
area: play
depends_on: [T-006, T-017, T-026, T-029]
blocks: [T-033, T-041]
---

# T-030 Start play mode from a chosen map

## Outcome

The play page loads the project, starts on the map marked as the start map, and runs the engine session. The editor has a control that sets the start map and opens play.

## Why

Play currently draws every legacy placement with a private camera. Gate A needs a session.

## Scope

In:

- Project field `startMapId`.
- Play boot path.
- Editor control.

Out:

- Save slots (T-041).
- Title screen.

## Touch

- Project type
- `src/Client/play.ts`
- Editor menu or map list

## Approach

- Delete the placement-only draw loop in `play.ts` once the session draws. Do not leave both.
- If the start map is missing, play shows a plain message, not a throw.

## Acceptance

- [ ] Setting the start map and opening `/play` puts the player on that map's spawn.
- [ ] Another map is not visible until a warp or connection exists.

## Test plan

- Manual with two maps. Confirm play uses the one marked start.
