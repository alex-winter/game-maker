---
id: T-040
title: Store story flags and variables
status: backlog
priority: P1
phase: 6
type: feat
area: domain
depends_on: [T-012]
blocks: [T-038, T-041, T-050]
---

# T-040 Store story flags and variables

## Outcome

The project names flags. A play session has a set of those flags and a string-keyed number map. Domain functions set, clear, and read them. Dialog and items can refer to a flag id.

## Why

Items, gates, and 'already talked' all need one memory. Scattered booleans will not survive save.

## Scope

In:

- `Flags` type and functions.
- Authoring a flag name in the editor.
- Session state that holds the current values.

Out:

- Save to disk (T-041).
- A full scripting language.

## Touch

- `src/domain/flags.ts`
- Project type
- Editor list

## Approach

- Flags are strings the author writes, stored as a set of the ones that are true. Unknown ids read as false.
- Variables are a separate map. Do not overload flags as numbers.

## Acceptance

- [ ] Tests for set, clear, and unknown.
- [ ] A flag created in the editor is present in the project file.

## Test plan

- Domain tests. Reload the editor.
