# Tickets

The ticket files are the source of truth. When you change a status or a dependency, update the ticket frontmatter and this table together.

## Status

| Status | Meaning |
| --- | --- |
| `ready` | An agent may take it. Dependencies are already `done`, or it has none. |
| `in_progress` | An agent is doing it. Do not take it. |
| `blocked` | Dependencies are not done. Prefer leaving it as `backlog` until promotion. |
| `backlog` | Specified, not yet promotable. |
| `done` | Acceptance criteria are true. Record the commit in the ticket's Outcome section if it helps. |

## Pick the next ticket

Choose the lowest id with `status: ready`. Set it to `in_progress` here and in the ticket file before editing `src/`. When it is `done`, mark it here, then set a `backlog` ticket to `ready` when every id in its `depends_on` is `done`.

Phase 0 tickets with no dependencies start `ready`. T-007 and T-008 are phase 0 and stay `backlog` until the tickets they depend on are `done`. Later phases start `backlog`.

## Index

| Id | Phase | Priority | Status | Area | Title |
| --- | --- | --- | --- | --- | --- |
| [T-001](T-001-stop-handlers-after-errors.md) | 0 | P0 | done | server | Stop request handlers after an error response |
| [T-002](T-002-paint-in-canvas-space.md) | 0 | P0 | done | editor | Paint and preview in canvas space |
| [T-003](T-003-load-placements-once.md) | 0 | P0 | done | editor | Load each placement once |
| [T-004](T-004-one-camera.md) | 0 | P0 | done | editor | Share one camera across layers |
| [T-005](T-005-layer-updates-are-single.md) | 0 | P0 | done | editor | Update only the layer that changed |
| [T-006](T-006-play-mode-camera-loop.md) | 0 | P0 | done | play | Make play mode a frame loop with the editor's draw order |
| [T-007](T-007-sheet-import-round-trip.md) | 0 | P0 | done | editor | Make sprite sheet import open the file that was uploaded |
| [T-008](T-008-tools-hit-the-cell.md) | 0 | P0 | done | editor | Make pencil, fill, and eraser hit the cell under the cursor |
| [T-009](T-009-safe-upload-names.md) | 0 | P0 | done | server | Store uploads under a generated name |
| [T-010](T-010-fix-frame-delay.md) | 0 | P1 | done | editor | Fix the canvas frame delay |
| [T-011](T-011-typecheck-and-run-scripts.md) | 0 | P1 | done | repo | Add typecheck and a documented way to run |
| [T-012](T-012-domain-boundary.md) | 1 | P1 | done | domain | Cut a pure domain layer out of the UI |
| [T-013](T-013-project-of-maps.md) | 1 | P1 | done | server | Store a project that contains many maps |
| [T-014](T-014-metatile-model.md) | 1 | P1 | done | domain | Add a metatile map and tileset model |
| [T-015](T-015-assets-are-files.md) | 1 | P1 | done | server | Serve sheet images as files |
| [T-016](T-016-atomic-json-writes.md) | 1 | P1 | done | server | Write JSON by rename |
| [T-017](T-017-shared-render-loop.md) | 1 | P1 | done | engine | Draw a map through one engine loop |
| [T-018](T-018-in-house-elements.md) | 1 | P2 | done | editor | Replace the third-party element base |
| [T-019](T-019-tileset-palette.md) | 2 | P1 | done | editor | Import a sheet as a tileset palette |
| [T-020](T-020-paint-metatiles.md) | 2 | P1 | done | editor | Paint metatiles and delete placement painting |
| [T-021](T-021-grid-zoom-coordinates.md) | 2 | P1 | done | editor | Show a grid, zoom, and the cell coordinate |
| [T-022](T-022-collision-attributes.md) | 2 | P1 | done | editor | Paint collision and elevation as attributes |
| [T-023](T-023-overhead-layer.md) | 2 | P1 | done | engine | Draw an overhead layer above actors |
| [T-024](T-024-undo-redo.md) | 2 | P1 | done | editor | Undo and redo map strokes |
| [T-025](T-025-map-list.md) | 2 | P1 | done | editor | Create, rename, resize, and delete maps |
| [T-026](T-026-player-steps.md) | 3 | P1 | done | engine | Step the player from cell to cell |
| [T-027](T-027-walk-animation.md) | 3 | P1 | done | engine | Animate the player in four directions |
| [T-028](T-028-movement-collision.md) | 3 | P1 | done | domain | Block steps into solid cells |
| [T-029](T-029-follow-camera.md) | 3 | P1 | done | engine | Follow the player in a 240×160 view |
| [T-030](T-030-play-starts-a-session.md) | 3 | P1 | done | play | Start play mode from a chosen map |
| [T-031](T-031-map-connections.md) | 4 | P1 | done | domain | Connect maps along an edge |
| [T-032](T-032-warps.md) | 4 | P1 | done | domain | Warp through doors and stairs |
| [T-033](T-033-map-fade.md) | 4 | P2 | done | engine | Fade between maps |
| [T-034](T-034-interact.md) | 5 | P1 | done | engine | Interact with the cell the player faces |
| [T-035](T-035-message-box.md) | 5 | P1 | done | engine | Show paging messages |
| [T-036](T-036-author-dialog.md) | 5 | P1 | done | editor | Author dialog in the project |
| [T-037](T-037-dialog-choices.md) | 5 | P1 | done | domain | Branch dialog with choices |
| [T-038](T-038-items.md) | 6 | P1 | ready | domain | Define items and pick them up once |
| [T-039](T-039-bag.md) | 6 | P1 | backlog | play | Open a bag from the field |
| [T-040](T-040-flags.md) | 6 | P1 | done | domain | Store story flags and variables |
| [T-041](T-041-save-load.md) | 6 | P1 | ready | play | Save and load a play session |
| [T-042](T-042-place-npcs.md) | 7 | P1 | ready | editor | Place NPC object events |
| [T-043](T-043-npc-talk.md) | 7 | P1 | backlog | engine | Talk to an NPC |
| [T-044](T-044-npc-movement.md) | 7 | P2 | backlog | engine | Let NPCs look around or wander |
| [T-045](T-045-animated-tiles.md) | 8 | P2 | backlog | engine | Animate water and other tiles |
| [T-046](T-046-start-menu.md) | 6 | P1 | ready | play | Open a field start menu |
| [T-047](T-047-party-model.md) | 8 | P1 | backlog | domain | Model a party of creatures |
| [T-048](T-048-encounters.md) | 8 | P1 | backlog | domain | Start an encounter from grass |
| [T-049](T-049-trainer-sight.md) | 8 | P2 | backlog | engine | Let a trainer notice the player |
| [T-050](T-050-field-gates.md) | 8 | P2 | backlog | domain | Open a field gate with a flag |
| [T-051](T-051-vertical-slice.md) | 8 | P1 | backlog | content | Build the Gate A and Gate B town in the editor |
| [T-052](T-052-move-catalog.md) | 9 | P1 | backlog | domain | Define moves and a type chart |
| [T-053](T-053-battle-scene.md) | 9 | P1 | backlog | engine | Resolve a single-creature battle |
| [T-054](T-054-experience.md) | 9 | P2 | backlog | domain | Award experience and levels |
| [T-055](T-055-party-screen.md) | 9 | P2 | backlog | play | Show the party screen |
| [T-056](T-056-wild-battle.md) | 9 | P1 | backlog | engine | Run wild encounters through the battle scene |
| [T-057](T-057-trainer-battle.md) | 9 | P1 | backlog | engine | Run trainer battles through the battle scene |

## Counts

- ready: 4
- in_progress: 0
- backlog: 16
- done: 38
- total: 57
