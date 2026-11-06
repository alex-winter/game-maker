# Overview

## Intent

Build a game maker for 2D overworld games in the style of Pokémon generation 3 (Ruby, Sapphire, Emerald, and the same field feel as FireRed and LeafGreen). The first proof is that this tool can build that kind of game: walk a town, enter a house, find an item, talk to someone, and come back later to a world that remembers.

The maker is the engine. Authoring and playing are two hosts of the same rules. A map must not mean one thing in the editor and another thing on the play page.

## What "gen 3 esque" means here

It means the field game, not a clone of Nintendo's ROMs, tools, or art.

- Movement is on a 16×16 grid. The player steps tile to tile, faces four directions, and can stand still in a pose.
- Maps are tile grids with a ground layer and an overhead layer (tree tops, roofs, the front of buildings) so the player can walk behind parts of the picture.
- Collision is data, separate from the picture. Some cells block. Some cells are one-way (ledges). Elevation stops the player walking onto a higher cell.
- Towns connect to routes by walking off the edge. Houses, stairs, and caves are warps to another map, with a facing on arrival.
- The player presses a button to face a sign, an item, or a person and get a message. Messages can page, and can offer choices.
- Items can be picked up once. A flag remembers that.
- People stand, look around, or wander, and they block the player's path.
- The playable view is the GBA picture, 240×160, scaled up with nearest-neighbor so pixels stay sharp.
- A field menu can open a bag, a party, and save.
- Wild grass and trainers can start a battle. The battle itself is a later system with a clean handoff, not a pile of special cases in the walk code.

Hardware details that do not matter: the GBA's 8×8 tile VRAM, palette banking, and ROM pointer layout. Author maps as metatiles. Let the user import their own sheets.

## Constraints

- The game and the editor are TypeScript written as small, single-purpose functions and small classes. Rules compose. A function that loads a map does not also draw it and also write the disk.
- Domain rules (collision, warps, dialog conditions, inventory) do not import the DOM, Express, or a component library. The browser and the server are adapters.
- Do not add a game framework, a UI framework, or a state library. The bundler and the local server may use packages. See [decisions/0004-dependencies.md](decisions/0004-dependencies.md).
- Do not commit Nintendo, Game Freak, or other copyrighted sprites, music, or maps. The tool imports assets the user supplies.
- Do not grow the current "paste an image onto a layer" model. It cannot be a metatile map. New map features land on the model in [decisions/0001-tile-grid.md](decisions/0001-tile-grid.md).

## Gates

Work is finished only when the gate's scene can be built **in this tool** and played **in this tool**, using imported placeholder art.

### Gate A — overworld

A small town with:

- ground and overhead metatiles
- collision that blocks walls and allows the path
- a player who walks, runs, and animates in four directions
- one route entered by walking off the edge
- one house entered through a door, and left again
- one sign with paging text
- one item that can be picked up once
- one NPC who can be talked to
- a save that restores position, the missing item, and the flags

### Gate B — field RPG

Gate A, plus a start menu, a bag with the picked-up item, a party of creatures with species and levels, a patch of grass that can start an encounter, a trainer who notices the player, and a field gate (a tree, a rock, a water tile) that opens when a flag is set.

Battles at this gate may be a dedicated scene with a win and a loss. They do not need every status ailment. The data they use must be the same data Gate C will use, so Gate B does not invent a throwaway battle.

### Gate C — battle

A battle scene that consumes the party model: moves, types, accuracy, damage, fainting, experience, and a switch. Wild encounters and trainers both enter through it.

Gate A is the first milestone. Do not start Gate C systems while Gate A tickets are open.

## Non-goals

- Emulating a Game Boy Advance, or importing `.gba` ROMs.
- An online multiplayer editor.
- A general 3D engine, a physics engine, or a freeform drawing app.
- Mobile packaging. The play page is a browser page.
- Pixel-perfect recreation of any named Pokémon town. The vertical slice is original content with original or user-supplied art.
