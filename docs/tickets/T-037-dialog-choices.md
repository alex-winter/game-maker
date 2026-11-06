---
id: T-037
title: Branch dialog with choices
status: done
priority: P1
phase: 5
type: feat
area: domain
depends_on: [T-035, T-036]
blocks: [T-043]
---

# T-037 Branch dialog with choices

## Outcome

A page can offer up to four choices. Each choice points at another dialog id or ends the conversation. The message box shows the choices and the interact key confirms the highlighted one.

## Why

Gate A talk is thin without a yes/no. The old `Replies` type gestured at this and also at skills and events it does not have.

## Scope

In:

- Choice data and highlighting.
- Editor can add choices to a page.
- Play moves the highlight and confirms.

Out:

- Skill gates, items as conditions. Flags can be read here only if T-040 has landed; otherwise leave a `whenFlag` field off the type until then.

## Touch

- Domain dialog type
- Message runner
- Editor dialog UI

## Approach

- A page is text plus `choices: { label, nextDialogId: string | null }[]`. Empty choices means 'confirm to continue or close'.
- Highlight is state in the runner, not in the DOM.

## Acceptance

- [x] A test conversation takes the second choice and lands on the linked dialog.
- [x] In play, the highlight moves and confirm branches.

## Test plan

- Runner unit test. Manual yes/no sign.

## Result

- `domain/dialog.ts`: `DialogPage { text, choices }`, `Choice { label, nextDialogId | null }`, `MAX_CHOICES` 4, `newPage`, `isDialogPage`; `withDialogDefaults` / `withPageDefaults` read the bare-string pages T-035 stored, applied in `withProjectDefaults`. The API accepts only the new shape.
- `engine/message.ts`: `MessageState.highlight`, `moveHighlight` (clamped), `advanceMessage(state, resolve)` branches on the highlighted choice — its dialog opens from page one, null closes, a missing dialog shows the placeholder page — and `drawMessageBox` paints the choice box above the message with a ▶ cursor.
- `engine/field.ts`: `FieldState.lastDirection`; while a message is open a fresh up/down press moves the cursor once (holding does not repeat) and the interact key confirms.
- `DialogEditor`: per page up to four choices, each a label and a target select ("ends the conversation" or "→ dialog"); "+ Choice" defaults the first two labels to Yes/No. `SignForm`'s preview reads `pages[0].text`.
- Tests: the runner takes the second choice and lands on the linked dialog, clamps, handles a deleted target, draws the box; the field session moves the cursor on a press, not a hold, and confirms each branch. Verified in headless Chrome: a Yes/No on the town sign, No closes, Yes opens the Boat dialog.
- No `whenFlag` on the type; T-040 can add it.
