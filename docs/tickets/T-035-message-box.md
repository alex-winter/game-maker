---
id: T-035
title: Show paging messages
status: done
priority: P1
phase: 5
type: feat
area: engine
depends_on: [T-034]
blocks: [T-037, T-043, T-046]
---

# T-035 Show paging messages

## Outcome

Play can show a message box at the bottom of the 240×160 view. Text pages on the interact key. While a message is open, the player does not walk.

## Why

Signs and talk are the rest of Gate A. The current `DialogCreator` textarea is not this.

## Scope

In:

- A message runner: text, page breaks, advance, close.
- Drawing a frame and text into the play view.
- A built-in font or a bitmap font the repo generates. Do not depend on a network font for play.

Out:

- Choices (T-037).
- Portraits.
- The full authoring UI (T-036).

## Touch

- `src/engine/message.ts`
- Play render

## Approach

- Page breaks are explicit `` or an array of pages. Do not auto-paginate in a clever way unless the rule is tested.
- The runner is pure: `advance(state) => state`. The host draws `state.currentPage`.

## Acceptance

- [x] A three-page message advances twice and closes on the third confirm.
- [x] Movement input does nothing while it is open.
- [x] A sign event from T-034 opens it.

## Test plan

- Unit test the runner. Manual sign.

## Result

- `engine/message.ts`: `MessageState { pages, index }`, `openMessage`, `advanceMessage` (null closes), `currentPage`, `isLastPage`, `wrapText` (spaces, explicit `\n`, long words split), `MESSAGE_COLUMNS` 36 × `MESSAGE_LINES` 2, and `drawMessageBox(port, state, view, zoom)` that paints the bottom panel through the new `DrawPort.fillText` (canvas adapter: built-in monospace, no network font).
- `domain/dialog.ts`: `Dialog { id, name, pages }`, `newDialog`, `isDialogInput`; the project gains `dialogs: Dialog[]` with `findDialog/addDialog/withDialog/removeDialog` (routes and UI are T-036).
- `engine/field.ts`: `FieldState.message`; `FieldWorld.pagesOf(dialogId)`; a sign interaction opens the box (a missing dialog shows a placeholder page naming the id), movement is ignored while it is open, the interact key pages and closes it. Closing is not a new look.
- Tests: runner paging, wrapping, the draw calls, and the field session (open → held run-down does nothing → page → close → walking resumes; missing dialog). Verified in headless Chrome with a seeded dialog on the sign from T-034.
