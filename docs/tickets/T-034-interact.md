---
id: T-034
title: Interact with the cell the player faces
status: done
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

- [x] Tests for each facing, for an empty cell, and for a cell with two events (the nearest authored priority: NPC, then item, then sign).
- [x] In play, the key does not also move the player.

## Test plan

- Domain tests.

## Result

- `domain/interact.ts`: `cellInFront(player)` (past the step target while stepping), `Interaction` union (`sign` with `dialogId`, `item` with `itemEventId`, `npc` with `npcId`), `interactionAt(events, cell)` with priority NPC → item → sign (warps never answer), `resolveInteraction(player, events)`.
- `MapEvent` grew `Sign { dialogId }` plus minimal `ItemEvent { itemId }` / `NpcEvent { npcId }` so the resolver and the route validate them; `withEvent` keeps one event per kind per cell; `eventsAt`. The editor overlay letters them S/I/N.
- `engine/field.ts`: `FieldInput.interact`; a press while standing resolves into `state.interaction` without moving the player (cleared next frame). `play.ts` binds Z/Enter/Space (edge-triggered, `preventDefault` so Space does not scroll) and for now `console.info`s the result; T-035 shows it.
- Tests: each facing, stepping look-ahead, empty cell and warp-only cell, sign, two- and three-event priority, and the session test that the key reports the sign and does not move even with a direction held. Verified in headless Chrome against a sign on a wall cell.
