# Docs for people and agents

This folder is the working memory of the project. Read it before editing `src/`. Update it when behavior, architecture, or ticket status changes.

## Read order

1. [overview.md](overview.md) — what this program is for, and the gates that mean "done enough".
2. [architecture.md](architecture.md) — how the code actually runs today.
3. [problems.md](problems.md) — defects already found. Do not rediscover them; fix the linked ticket.
4. [standards.md](standards.md) — how to write the TypeScript.
5. [decisions/](decisions/) — choices that later work must follow.
6. [roadmap.md](roadmap.md) — phases and exit criteria.
7. [tickets/README.md](tickets/README.md) — pick the next ticket from here.

## How to do work

- Take the lowest-numbered ticket whose `status` is `ready` and whose `depends_on` tickets are all `done`.
- Set that ticket to `in_progress` in its file and in the index table before writing code.
- Stay inside the ticket's scope. If you find a new defect, add a ticket instead of quietly expanding the change.
- When the acceptance criteria are true, set `status` to `done`, note the commit, and promote newly unblocked tickets to `ready` as the roadmap describes.
- If a ticket's approach is wrong once you are in the code, change the ticket first so the next agent inherits the correction.

## How to add a ticket

Copy [tickets/TEMPLATE.md](tickets/TEMPLATE.md). Use the next free `T-0xx` id. Link it from [tickets/README.md](tickets/README.md) and, if it is a defect, from [problems.md](problems.md).

## Vocabulary

Use these words in code, tickets, and docs. Do not invent a parallel set.

| Word | Meaning |
| --- | --- |
| Project | One game: its maps, tilesets, actors, items, dialog, and flags. |
| Map | One screen-space place (a town, a house interior, a route). |
| Metatile | The 16×16 cell the player steps on. Gen 3 maps are authored in metatiles. |
| Tileset | An image sliced into metatiles, plus the attributes of each metatile. |
| Layer | A full-map grid of metatile ids drawn in a fixed order. |
| Attribute | Per-cell data that is not a picture: collision, elevation, ledge direction. |
| Object event | A placed thing that is not a tile: the player start, an NPC, an item, a sign. |
| Warp | A cell that moves the player to another map and cell. |
| Connection | A seam where walking off one map continues onto a neighboring map. |
| Flag | A named boolean the story can set and read. |
| Engine | The runtime that draws a map and advances actors. Editor and play both host it. |
| Placement | Today's temporary model: a free image pasted at a coordinate. It is not a metatile. Retire it. Do not build new features on it. |
