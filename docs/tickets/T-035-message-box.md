---
id: T-035
title: Show paging messages
status: backlog
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

- [ ] A three-page message advances twice and closes on the third confirm.
- [ ] Movement input does nothing while it is open.
- [ ] A sign event from T-034 opens it.

## Test plan

- Unit test the runner. Manual sign.
