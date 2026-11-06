---
id: T-034
title: Interact with the cell the player faces
status: ready
priority: P1
phase: 5
type: feat
area: engine
depends_on: [T-026]
blocks: [T-035, T-038, T-043]
---

# T-034 Interact with the cell the player faces

## Outcome

A dedicated key (Z or Enter) reports the cell in front of the player. The session resolves a sign, an item, or an NPC there. If none, nothing happens.

## Why

Gen 3 talk and signs are a facing check, not a click.

## Scope

In:

- Pure `cellInFront(actor)`.
- A resolver over map events.
- The key binding in play.

Out:

- The message UI (T-035).
- Placing the events, except a minimal sign so the resolver can be tested (authoring UI can be T-036).

## Touch

- `src/domain/interact.ts`
- Play input

## Approach

- The resolver returns a discriminated union: `{ kind: 'sign', dialogId }`, `{ kind: 'item', itemEventId }`, `{ kind: 'npc', npcId }`, or none.
- It does not open UI. The host does, in later tickets.

## Acceptance

- [ ] Tests for each facing, for an empty cell, and for a cell with two events (the nearest authored priority: NPC, then item, then sign).
- [ ] In play, the key does not also move the player.

## Test plan

- Domain tests.
