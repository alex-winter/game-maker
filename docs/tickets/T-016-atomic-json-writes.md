---
id: T-016
title: Write JSON by rename
status: ready
priority: P1
phase: 1
type: fix
area: server
depends_on: [T-011]
blocks: []
---

# T-016 Write JSON by rename

## Outcome

A crash during a save cannot leave a half-written project file. Readers never see a partial JSON document.

## Why

`writeJson` uses `writeFileSync` on the destination. See docs/problems.md item 4.

## Scope

In:

- `writeJson` writes a temp file in the same directory and renames it over the target.
- Every current caller goes through that function.

Out:

- A database.
- File locking across processes. One server process is the assumption. Mention it in the function doc comment.

## Touch

- `src/Server/services/write-json.ts`

## Approach

- `fs.writeFileSync` to `file.json.tmp` then `fs.renameSync`. Rename on the same directory is atomic on the filesystems we care about.
- If the write throws, delete the temp file and rethrow. Do not rename.

## Acceptance

- [ ] A unit test of a small wrapper can simulate a throw before rename and show the original file remains. If the real `fs` module is awkward to fake, extract the sequence as a function that takes `write` and `rename`.
- [ ] The project file after a normal save still parses.

## Test plan

- Node test for the failure path. One manual save through the editor.
