---
id: T-043
title: Talk to an NPC
status: done
priority: P1
phase: 7
type: feat
area: engine
depends_on: [T-034, T-035, T-037, T-042]
blocks: [T-049, T-051]
---

# T-043 Talk to an NPC

## Outcome

Interacting with the cell in front of an NPC opens their dialog, including choices. The NPC faces the player while the message is open, then returns to their previous facing.

## Why

This is the talk half of Gate A.

## Scope

In:

- Resolver result from T-034 opens the dialog id.
- Facing override during the message.

Out:

- Trainer battles (T-049).
- Movement AI (T-044).

## Touch

- Play session
- Domain facing helper

## Approach

- Facing the player is a pure function of the two cells. If they are not adjacent it is not a conversation.

## Acceptance

- [x] A test of the facing helper for all four sides.
- [x] Manual: talk, pick a choice, watch the NPC turn back.

## Test plan

- Unit test facing. Manual conversation.

## Result

- `faceToward(from, to)` (`domain/interact.ts`) — the direction a person on `from` turns to face `to`; undefined unless they are neighbours. Tested on all four sides, a diagonal, two cells away, and the same cell.
- Field session: an `npc` interaction opens the dialog's pages through `world.pagesOf` (`missingDialogPages` when the id is gone, `silentPages(name)` when the person has no dialog yet) and records `talkingTo: { eventId, facing }`; it clears when the message closes, including through a choice with no target. `npcFacing(state, npc)` gives the facing to draw; play uses it for the NPC actors.
- Tests: the conversation opens with choices, Mom faces the player, "No" closes and she turns back, "Yes" branches while still talking; a silent person says so.
- Verified in headless Chrome: Mom placed above the spawn facing left; after walking up and pressing Z the welcome dialog with Yes/No opens and Mom's sprite turns down toward the player; after choosing No the box closes and her region of the canvas is pixel-identical to before the talk. A sprite-less Kid shows the placeholder line.
