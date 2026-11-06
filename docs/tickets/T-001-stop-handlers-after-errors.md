---
id: T-001
title: Stop request handlers after an error response
status: done
priority: P0
phase: 0
type: bug
area: server
depends_on: []
blocks: [T-013]
---

# T-001 Stop request handlers after an error response

## Outcome

A missing layer delete returns 404 and leaves every layer in place. A non-array layer POST returns 400 and leaves the file unchanged.

Done in commit `fix(server): stop request handlers after an error response (T-001)`. The body check is `isLayerList` in `src/Server/services/is-layer-list.ts`, with a `node:test` file beside it that `npm test` runs once T-011 lands.

## Why

`src/Server/RequestHandlers/delete-layers.ts` sends 404 and then still runs. `Array.splice(-1, 1)` removes the last layer, and a second `response.json` writes after headers are sent. `post-layers.ts` sends 400 and then spreads `request.body` anyway. See docs/problems.md item 1.

## Scope

In:

- Both handlers return on every error path.
- The success path runs only after the body is known to be valid.
- A short comment is not a substitute for the return.

Out:

- A general validation framework.
- Atomic file writes (T-016).

## Touch

- `src/Server/RequestHandlers/delete-layers.ts`
- `src/Server/RequestHandlers/post-layers.ts`

## Approach

- After `response.status(...).json(...)`, return. In the delete handler, do not splice when `findIndex` is -1.
- In the post handler, confirm `Array.isArray(request.body)` and that each entry has a string `uuid` before reading the file. Reject otherwise.
- Keep the handlers as functions. Pull the 'is this a layer' check into a pure function if it is more than a couple of predicates, and unit-test that function.

## Acceptance

- [x] DELETE `/layers/<unknown>` responds 404 and `layers.json` is byte-for-byte unchanged.
- [x] POST `/layers` with `{}` responds 400 and the file is unchanged.
- [x] POST of a valid one-element array still appends that layer.
- [x] DELETE of a real uuid still removes only that layer.

## Test plan

- Start the server, seed `data/layers.json` with two layers, and run the four requests with `curl`. Compare the file before and after the error cases.
