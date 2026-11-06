---
id: T-050
title: Open a field gate with a flag
status: done
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

- [x] A test: blocked when the flag is clear, open when set, and the displayed metatile id changes.
- [x] Manual: talk to an NPC who sets the flag, then walk through.

## Test plan

- Extend collision tests. Manual gate.

## Result

- `AttributeLayer.gate: (Gate | null)[]` with `Gate { flagId, openMetatileId | null }`; defaults, resize, validation, `gateAt`, `withGate`, and `withOpenGates(map, isOpen)` (swaps the front-most painted picture of each open gate; the stored map is untouched).
- `canStep(map, tileset, from, to, isOpen = nothing open)` and `stepRule(..., isOpen)`: a gate cell is a wall until its flag answers true. Existing tests unchanged; a new one covers shut, open, and the displayed metatile.
- `FieldWorld.canEnter(mapId, memory)`; play builds the rule with `hasFlag(memory, …)` and rebuilds it — and the scene through `withOpenGates` — only when `memory.flags` changes.
- How the flag gets set: `DialogPage.setsFlagId?` — the field sets it the frame the page is shown (`rememberingPage`); the dialog editor has a “When shown: sets …” select per page; the server keeps the field.
- Editor: **Gates** row (orange), `GateForm` (flag with “+ New flag”, open metatile with preview, Remove), rubber removes, overlay draws an orange G.
- Field test: a woodsman's second page sets the flag; the step west is refused before and taken after. Checked in Chrome on Atomic House: placed a gate at (9, 10) showing metatile #2, set the flag from the dialog editor on the woodsman's second page, in play the step west was refused, talking swapped the picture the moment the page appeared, the step went through, and the save held the flag.
