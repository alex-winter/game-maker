---
id: T-013
title: Store a project that contains many maps
status: ready
priority: P1
phase: 1
type: feat
area: server
depends_on: [T-001, T-005, T-012]
blocks: [T-014, T-015, T-025, T-036]
---

# T-013 Store a project that contains many maps

## Outcome

The disk has a project with an id, a name, and a list of maps. The editor loads that project instead of a single global layer array. Existing `layers.json` is imported once into a legacy map so current paintings are not thrown away.

## Why

`Project` and `projectsDir` are unused. One `layers.json` is the whole game, so a house and a town cannot both exist. See docs/problems.md item 18.

## Scope

In:

- A `Project` type: id, name, map ids.
- A `Map` type that, for this ticket, still wraps the current layer list. Metatiles arrive in T-014.
- Routes to get the project, add a map, rename a map.
- One-shot import from `data/layers.json` when the project file is missing.

Out:

- The map list UI beyond the minimum needed to prove two maps load (full UI is T-025).
- Per-user projects. There is one local project.

## Touch

- `src/domain` project types
- `src/Server` routes and `config.ts`
- `src/Client` load path in `WorldEditor`

## Approach

- Write `data/project.json`. Leave the old file in place after import and stop reading it on later boots.
- Map id is a uuid. The editor holds the active map id in memory and can switch by reloading layers for that map.
- Handlers validate and return, in the style of T-001.

## Acceptance

- [ ] Booting on an old `layers.json` yields a project with one map whose placements match.
- [ ] A second map can be created and fetched without deleting the first.
- [ ] Restarting the server keeps both.

## Test plan

- Curl the project routes. Reload the editor and see the imported paintings.
