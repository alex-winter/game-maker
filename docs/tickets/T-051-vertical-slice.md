---
id: T-051
title: Build the Gate A and Gate B town in the editor
status: backlog
priority: P1
phase: 8
type: feat
area: content
depends_on: [T-027, T-031, T-032, T-038, T-039, T-041, T-043, T-049, T-050]
blocks: []
---

# T-051 Build the Gate A and Gate B town in the editor

## Outcome

The repo contains instructions, and a script or checked-in project built only with this tool's format, for a small original town: a route connection, a house with a door, a sign, an item, an NPC conversation, grass that can encounter, one trainer, and one flag gate. Placeholder art is generated, not copied from a game.

## Why

The benchmark is that the tool can build the game, not that the engine functions exist in isolation. See docs/overview.md Gate A and Gate B.

## Scope

In:

- The sample project.
- A written walkthrough in `docs/sample-town.md` of how to play it.
- Any engine bug found while building it becomes its own ticket if it is not a one-line fix inside this work. Note those tickets in the sample doc.

Out:

- A full region.
- Borrowed Pokémon designs, names that imply a specific monster, or ripped tiles.

## Touch

- Project data under something like `examples/town/`
- `docs/sample-town.md`

## Approach

- Build it through the editor where the editor can. If a field can only be set by editing JSON, that is a missing ticket: file it and keep the JSON edit only if the ticket cannot land in the same change.
- Generated art: a node script that writes PNGs of flat colors and simple shapes into the example folder is fine.

## Acceptance

- [ ] A new player can follow `docs/sample-town.md` and: walk to the route, enter the house, leave, read the sign, take the item once, talk to the NPC, reload a save, step in grass, trigger the trainer once, and pass the gate after the flag.
- [ ] No copyrighted sprites are in the example.

## Test plan

- Play the walkthrough. Tick every step in the sample doc as you go, and leave the doc as prose, not as a checklist of your process.
