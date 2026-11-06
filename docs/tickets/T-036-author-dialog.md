---
id: T-036
title: Author dialog in the project
status: done
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

- [x] Create a dialog, place a sign, reload, the sign still has that dialog.
- [x] The editor no longer opens an empty dialog window by itself.
- [x] Play shows the pages through T-035 once both tickets are done. If T-035 is not done yet, the data is still saved and a test reads it back.

## Test plan

- Reload test via the API or the UI. Manual sign after both tickets.

## Result

- `Dialog { id, name, pages }` on the project (`domain/dialog.ts`, landed with T-035) now has routes: `POST/PUT/DELETE /project/dialogs[/:dialogId]` (`Server/RequestHandlers/dialogs.ts`, `isDialogInput`), and `projectRepository.createDialog/saveDialog/deleteDialog`.
- `DialogEditor` replaces `DialogCreator`: a window from the side menu's speech-bubble button (`open-dialog-editor`); pick, create (prompt for a name), rename, delete; one textarea per page with add/remove, saved on change; a per-page line count that turns orange when the page wraps past the two lines the play box shows.
- Sign placement: on the Events target an empty cell opens `EventKindPicker` (Warp or Sign); `SignForm` picks the dialog, previews its first page, and links to the dialog editor; clicking an existing sign edits or deletes it; the rubber clears every event on the cell.
- `WorldEditor.build` no longer appends a dialog window. `Model/Dialog.ts` and `DialogCreator.ts` are deleted; `requiredSkillUuid` and replies were not carried forward (T-037 adds choices).
- Verified in headless Chrome: create a dialog, write two pages, place a sign at (9,10) pointing at it, reload, the saved event still carries that `dialogId`; clicking it again opens the edit form. Play reads it through T-035.
