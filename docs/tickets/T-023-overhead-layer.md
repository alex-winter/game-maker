---
id: T-023
title: Draw an overhead layer above actors
status: ready
priority: P1
phase: 2
type: feat
area: engine
depends_on: [T-017, T-020]
blocks: [T-029]
---

# T-023 Draw an overhead layer above actors

## Outcome

A map has a ground layer and an overhead layer. The engine draws ground, then actors, then overhead. The author chooses which layer they are painting.

## Why

Tree tops and the front of buildings must cover the player. That is a basic gen 3 read of a town.

## Scope

In:

- Two named draw passes.
- The editor can target either layer.
- Play uses the same passes, with a stand-in rectangle for the actor until T-026.

Out:

- Roof-open-when-inside behavior.
- More than these two passes. Extra ground layers can wait.

## Touch

- Domain map type, if it still has a free layer list: give layers a `pass: 'ground' | 'overhead'`.
- Engine render.

## Approach

- Sort by pass first, then by order inside the pass. Actors are drawn between the passes by the engine, not stored as a tile.

## Acceptance

- [ ] A tile on the overhead layer covers the stand-in actor. A ground tile does not.
- [ ] Editor and play agree.

## Test plan

- Recording-port test for draw order: ground, actor, overhead. Manual check.
