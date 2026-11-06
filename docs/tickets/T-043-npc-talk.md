---
id: T-043
title: Talk to an NPC
status: ready
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

- [ ] A test of the facing helper for all four sides.
- [ ] Manual: talk, pick a choice, watch the NPC turn back.

## Test plan

- Unit test facing. Manual conversation.
