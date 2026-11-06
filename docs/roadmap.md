# Roadmap

Phases run in order. Inside a phase, tickets run by id unless `depends_on` says otherwise. A phase ends when its exit criteria are true and its tickets are `done`.

Do not open a later phase by marking its tickets `ready` early to "make progress". The exception is a spike written into a ticket. There is no silent spike.

## Phase 0 — the current program tells the truth

The placement model is temporary. Phase 0 makes it predictable so later work has a stable base to migrate. It does not add metatiles, warps, or a player.

Tickets: T-001 through T-011. T-001 through T-006 and T-009 through T-011 start `ready`. T-007 waits on T-009. T-008 waits on T-002 and T-003.

Exit:

- Creating, painting, erasing, reordering, and deleting a layer round-trips through a reload.
- The stamp sits under the cursor.
- Editor and play paint layer order the same way.
- Holding an arrow in play pans smoothly, and a bad request cannot delete an unrelated layer.
- `npm run typecheck` exists and passes.

## Phase 1 — a domain that can hold a town

Replace the global image pile with a project of maps, without yet requiring the editor to be pleasant.

Tickets: T-012 through T-018. Promote T-012 to `ready` when phase 0 is done. The others become `ready` when their `depends_on` are `done`.

Exit:

- A project file can store two maps made of metatile ids.
- Images are files, not JSON strings.
- A node test can load a map and answer "is this cell blocked?"
- Editor and play both call the same draw function for a map.
- New UI code does not import `event-driven-web-components`.

## Phase 2 — the editor can build Gate A's maps

Tickets: T-019 through T-025.

Exit:

- A person can import a sheet, pick a metatile, and paint a town with ground, overhead, and collision.
- Undo removes the last stroke.
- Two maps can be created and renamed.

## Phase 3 — walk

Tickets: T-026 through T-030.

Exit:

- Play mode spawns the player on a map.
- The player steps cell to cell, animates, and stops at collision.
- The camera follows inside a scaled 240×160 view.

## Phase 4 — houses and routes

Tickets: T-031 through T-033.

Exit:

- Walking off a connected edge continues on the next map.
- A door warp enters a house and a second warp leaves it.
- The arrival cell and facing are the ones authored.

## Phase 5 — talk

Tickets: T-034 through T-037.

Exit:

- A sign and an NPC can show a paging message.
- A message can offer choices that branch.
- The dialog is saved in the project, not in component state.

## Phase 6 — items, memory, save

Tickets: T-038 through T-041, and T-046 (the field menu the bag and save hang off). T-046 keeps its id; its phase is 6.

Exit:

- An item can be taken once.
- The bag shows it.
- Saving and loading restores the player, the bag, and the flags.

Gate A is met at the end of phase 6, provided phases 2–5 used the tool to build the town rather than hard-coding it.

## Phase 7 — people who move

Tickets: T-042 through T-044.

Exit:

- NPCs are object events on the map.
- They can face, look around, or wander.
- The player collides with them and can talk to them.

## Phase 8 — field RPG

Tickets: T-045, T-047 through T-051. The start menu is T-046 and already landed in phase 6.

Exit: Gate B. A vertical slice town is authored in the editor and played end to end, including grass, a trainer handoff, a field gate, and the start menu.

## Phase 9 — battle

Tickets: T-052 through T-057.

Exit: Gate C. The same party model fights a wild encounter and a trainer with real moves.

## Working rules

- Fix the ticket you claimed. A drive-by refactor of a file you are not already editing belongs in a new ticket.
- When the placement model and the metatile model both exist, new authoring writes metatiles. Do not keep the two in sync forever. T-020 is the cut-over for painting. After it is `done`, delete the placement paint path in that same ticket, not in a follow-up that never happens.
- Placeholder art in tests is generated at runtime (solid colors, a few pixel rectangles). No external game's assets.
