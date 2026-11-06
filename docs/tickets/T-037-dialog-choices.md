---
id: T-037
title: Branch dialog with choices
status: ready
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

- [ ] A test conversation takes the second choice and lands on the linked dialog.
- [ ] In play, the highlight moves and confirm branches.

## Test plan

- Runner unit test. Manual yes/no sign.
