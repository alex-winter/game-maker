---
id: T-024
title: Undo and redo map strokes
status: done
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

- [x] Paint three cells, undo once, only the stroke returns, not a single cell, if they were one drag.
- [x] Redo restores them.
- [x] A new stroke after undo drops the redo branch.

## Test plan

- Unit test the history module. Manual keyboard test in the editor.

## Result

- `domain/history.ts`: immutable `History<T>` with `record`, `undo`, `redo`, `canUndo`, `canRedo`, capped at 50 by default. Tests cover one-step undo of a multi-cell edit, redo, dropping the redo branch, and the cap.
- `mapSession`: the first `update` after a `save` keeps the grid it replaced; `save` records it, so a drag, a fill, a rectangle, an attribute paint, or a layer-list edit is each one step. `undo`/`redo` restore a snapshot and write it. History is per session (not persisted) and resets when a map opens.
- `MapCanvas` binds Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y on the window, ignoring key presses inside inputs.
- Verified in headless Chrome: a 3-cell drag undoes as one step and redoes; a new stroke after undo drops the redo branch.
