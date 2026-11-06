---
id: T-030
title: Start play mode from a chosen map
status: done
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

- [x] Setting the start map and opening `/play` puts the player on that map's spawn.
- [x] Another map is not visible until a warp or connection exists.

## Test plan

- Manual with two maps. Confirm play uses the one marked start.

## Result

- `Project.startMapId` with `withStartMap`, `startMap` (chosen map, else the first), and `removeMap` clearing a deleted start map; `withProjectDefaults` fills null. `PUT /project/start-map`.
- `MapSelect` shows a flag button next to rename/resize/delete: it marks the active map as the start map (the option reads "Name (start)"), and clicking again clears it.
- `play.ts` opens `?map=<id>` when present (the editor's play button tries the active map), else `startMap(project)`; with no maps it replaces the canvas with a plain message. The placement-only loop was already gone (T-017/T-026); there is one session path.
- Verified in headless Chrome: flagging Atomic House makes plain `/play` show its painted grid at the spawn, `/play?map=` still opens a chosen map, clearing the flag falls back to the first map, and an empty project shows the message.
