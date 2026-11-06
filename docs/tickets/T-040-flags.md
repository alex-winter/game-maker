---
id: T-040
title: Store story flags and variables
status: done
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

- [x] Tests for set, clear, and unknown.
- [x] A flag created in the editor is present in the project file.

## Test plan

- Domain tests. Reload the editor.

## Result

- `domain/flags.ts`: `Flag { id, name }`, `Memory { flags, variables }`, `newMemory`, `hasFlag`/`setFlag`/`clearFlag` (unknown reads false; set and clear are no-ops when already so), `variable`/`withVariable`/`addToVariable` (unknown reads 0; a separate map, never overloaded), `isFlagInput`, `isMemory`.
- Project: `flags: Flag[]` with `findFlag/addFlag/withFlag/removeFlag`; `withProjectDefaults` fills an empty list. Routes `POST/PUT/DELETE /project/flags[/:flagId]`; `projectRepository.createFlag/renameFlag/deleteFlag`.
- Session: `FieldState.memory`, `newField(mapId, spawn, facing, memory = newMemory())` so T-041 can hand a loaded memory in.
- Editor: `FlagsEditor` window from the side menu's flag button — add (prompt), rename inline (saved on change), delete with a confirm that says events will point at nothing.
- Verified in headless Chrome: a flag created and renamed in the editor is in `data/project.json` and lists again after reload.
