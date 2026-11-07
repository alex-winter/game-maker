# Fernpost Town — the sample game

A small original town, built with nothing but this tool's own format, to show that the editor can make a game and not just that the engine's pieces work. It covers Gate A and Gate B from `overview.md`: a route reached by walking off the edge, a house with a door, a sign, an item taken once, a person to talk to, a save that resumes, tall grass with encounters, a trainer who notices you, a field gate opened by a flag — and, since phase 9 landed before this was built, battles through the real scene.

The art is generated: flat colours and simple shapes drawn by the build script. Nothing is copied from any game, and no name points at a particular monster.

## Build it

The script talks to the running editor over the same HTTP API the editor uses, so everything it writes is something you could have made by hand in the editor.

```
npm run build && npm start          # the editor, in one terminal
node examples/town/build.js         # the town, in another
```

It adds to whatever project is already there: a tileset called Fernpost, three maps (Fernpost Town, Fern Path, Marta's House), four sprites, three species, five moves, a small type chart, four flags, two items, four dialogs, and the encounter table. It sets the player sprite, the starter (a Lv5 Sprig), and the start map, so your previous choices for those three move aside. It refuses to run twice; to rebuild, delete the three maps in the editor (or `data/project.json` for a clean slate) and run it again.

Open `http://localhost:3000` to see the maps in the editor and `http://localhost:3000/play` to play. If an old save is found, pick **New game** the first time.

## Keys

Arrows walk, hold Shift to run. Z interacts and confirms. Enter or Escape opens the start menu and steps back out of its screens.

## A walk through the town

You start in the town square, on the crossroads, with a Sprig at your side. The path runs north to a house, east to the edge of town, and south to a fence.

Walk three cells west along the path and turn to face the signpost above you. Press Z: the sign has two pages, **FERNPOST TOWN** and *Where the ferns keep their posts.* Z pages through and closes it.

Two more cells west brings you under the house's path. Walk north: the fifth step lands on the door, the screen fades, and you are inside Marta's house facing the back wall. The bed in the top-left corner is a heal point — stand beside it, face it, and press Z. Your party is healed and this bed becomes the place you wake up after a lost battle. Walk back down onto the doormat in the bottom wall to fade out again and stand in front of the house.

Go back down to the main path and east past the square. Below the path at the twelfth column there is a wrapped box. Face it from the path and press Z: *You found a POTION!* Open the start menu with Enter and choose **Bag** to see it; the box is gone and stays gone.

The woman two cells north of there is Marta. Walk up to her, face her, and press Z. She asks whether you could use her hatchet; the choice box lists **Yes** and **No**. Say yes: the next page lends you the hatchet, and a flag is set as that page is shown. Say no, and the tree stays.

Go back to the crossroads and follow the path south. A fence runs across the whole town with one small tree in the gap. Before Marta's hatchet you walk into it and stop; with the flag set, the tree is a stump and you walk through. Beyond it, past the pond, a second box holds a Fern Berry.

Save here: Enter, then **Save**. Reload the page. The boot box says *A saved game was found.* — choose **Continue**, and you are standing where you saved, the Potion and Berry in the bag, both boxes gone, the tree still a stump. **New game** would start over at the square with a fresh Sprig.

Now go east along the main path and off the edge of the map. The screen fades and you are on Fern Path, which continues the same row. Follow the path east. Trainer Ivo stands three cells north of the path, looking down it: step into the column he watches and he walks up to you and challenges you. You cannot run from a trainer. He sends out a Flit and then a Pebble, one after the other — pick **FIGHT** and a move each turn (Leaf Cut is the one for the Pebble). When the second one faints, you win, Sprig takes its experience, and the flag *Beat Trainer Ivo* is set. Walk back through his line of sight and he stays put; talk to him and he grumbles.

The patches of taller grass on either side of the path hold wild Pebbles, Flits, and the odd Sprig. Walk through one: each step has a fifteen percent chance of an encounter. From a wild battle you can **RUN**. Open **Party** from the start menu to see Sprig's level, HP, and moves as the fights leave them.

If you lose a battle, the box says so, the screen fades, and you wake up at Marta's bed (or on the town square if you never used the bed) with your party as it was before the fight. The trainer's flag stays clear, so Ivo challenges you again.

## Where things are

| What | Map | Cell |
| --- | --- | --- |
| Start | Fernpost Town | 10, 10 |
| Sign | Fernpost Town | 7, 9 |
| House door (warp) | Fernpost Town | 5, 5 |
| Potion | Fernpost Town | 12, 11 |
| Marta | Fernpost Town | 12, 7 |
| Gate tree | Fernpost Town | 10, 14 |
| Fern Berry | Fernpost Town | 14, 18 |
| East seam to Fern Path | Fernpost Town | row 10 |
| Bed (heal point) | Marta's House | 1, 3 |
| Doormat (warp back) | Marta's House | 3, 7 |
| Trainer Ivo | Fern Path | 9, 7 |
| Tall grass | Fern Path | 3–5 × 2–4, 13–16 × 3–5, 5–8 × 12–14 |

## Notes for authors

A gate cell must be passable on its own: the gate does the blocking, and the tile under it only needs to look like a tree. The Fernpost tileset has a second tree (metatile 21) that is not solid for exactly this; the stump (14) is what the gate swaps in once it opens. A sign is not solid by itself either — the sign tile here is.

The start cell of a map is set from the event picker's **Start here** (T-058); the build script leaves the town's at its default, the centre, which is where the crossroads was put. Everything here can be made through the editor's forms.

Species and move numbers are the tool's own plain rules (`architecture.md`, Creatures and Battles). Sprig starts with Tackle and Leaf Cut so the Pebble, which resists normal moves, can be beaten.
