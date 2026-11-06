---
id: T-050
title: Open a field gate with a flag
status: backlog
priority: P2
phase: 8
type: feat
area: domain
depends_on: [T-022, T-028, T-040]
blocks: [T-051]
---

# T-050 Open a field gate with a flag

## Outcome

A cell can require a flag to enter (a cut tree, a boulder, surf). When the flag is set the cell is passable and can swap to a different metatile. The author sets the flag from dialog or from a debug control.

## Why

HM gates are how gen 3 routes change. The gate has to be data, not a special case per tree.

## Scope

In:

- Attribute `requiresFlag: string | null` and optional `openMetatileId`.
- `canStep` reads the session flags.
- Editor controls.

Out:

- The actual HM move in battle.
- Pushing a boulder one cell. A gate that disappears is enough.

## Touch

- Attribute type
- `canStep`
- Editor
- Render chooses the open metatile when the flag is set

## Approach

- `canStep` gains the flag set as an argument. Update its existing tests.

## Acceptance

- [ ] A test: blocked when the flag is clear, open when set, and the displayed metatile id changes.
- [ ] Manual: talk to an NPC who sets the flag, then walk through.

## Test plan

- Extend collision tests. Manual gate.
