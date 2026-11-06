---
id: T-024
title: Undo and redo map strokes
status: backlog
priority: P1
phase: 2
type: feat
area: editor
depends_on: [T-020]
blocks: []
---

# T-024 Undo and redo map strokes

## Outcome

Ctrl+Z undoes the last map edit. Ctrl+Shift+Z redoes it. A stroke, a fill, and an attribute paint are each one step.

## Why

Without undo a tile editor is not usable on a real map.

## Scope

In:

- A history stack of map snapshots or patches, capped (50 is enough).
- Keyboard shortcuts.
- The stack clears redo on a new edit.

Out:

- Undo across sessions.
- Undo of project rename or asset import.

## Touch

- A pure history module: `push`, `undo`, `redo`.
- Editor keybindings.

## Approach

- Store the previous grid (or the list of changed cells) before applying a stroke. Do not snapshot on every mousemove; snapshot when the stroke ends, but apply the cells live during the drag.
- The history module is domain-pure and tested.

## Acceptance

- [ ] Paint three cells, undo once, only the stroke returns, not a single cell, if they were one drag.
- [ ] Redo restores them.
- [ ] A new stroke after undo drops the redo branch.

## Test plan

- Unit test the history module. Manual keyboard test in the editor.
