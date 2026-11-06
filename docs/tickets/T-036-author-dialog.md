---
id: T-036
title: Author dialog in the project
status: ready
priority: P1
phase: 5
type: feat
area: editor
depends_on: [T-013]
blocks: [T-037, T-042]
---

# T-036 Author dialog in the project

## Outcome

The author writes dialog records (id, pages) in the editor, saves them on the project, and can attach a dialog id to a sign event on a cell.

## Why

`Dialog.ts` and `DialogCreator` are unsaved sketches, and the window opens itself on every load. See docs/problems.md item 13.

## Scope

In:

- Dialog stored on the project.
- Editor UI to add and edit one.
- Sign event placement on a map.
- Remove the automatic empty dialog window from `WorldEditor`.

Out:

- Branches (T-037).
- Skill checks. The `requiredSkillUuid` fields are unused; do not carry them forward unless a later ticket needs them.

## Touch

- Domain dialog type
- Replace `DialogCreator` or rebuild it so it reads and writes the project
- `WorldEditor` startup

## Approach

- A dialog is `{ id, pages: string[] }`. Keep it that small until T-037.
- Signs are map events `{ id, cell, dialogId }`.

## Acceptance

- [ ] Create a dialog, place a sign, reload, the sign still has that dialog.
- [ ] The editor no longer opens an empty dialog window by itself.
- [ ] Play shows the pages through T-035 once both tickets are done. If T-035 is not done yet, the data is still saved and a test reads it back.

## Test plan

- Reload test via the API or the UI. Manual sign after both tickets.
