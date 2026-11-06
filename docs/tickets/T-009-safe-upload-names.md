---
id: T-009
title: Store uploads under a generated name
status: ready
priority: P0
phase: 0
type: bug
area: server
depends_on: []
blocks: [T-007, T-015]
---

# T-009 Store uploads under a generated name

## Outcome

An uploaded sheet is stored as `<uuid><allowed extension>` inside `uploads/`. The original filename is display-only. A second file with the same original name does not overwrite the first. A filename containing `..` or a directory separator cannot escape `uploads/`.

## Why

`multer` uses `file.originalname` as the on-disk name. See docs/problems.md item 2.

## Scope

In:

- The storage filename is generated.
- The client still shows the original name.
- The extension is taken from an allow list, not concatenated from the raw name.

Out:

- Project-relative asset folders (T-015).
- Image decoding and size limits beyond the existing JSON limit.

## Touch

- `src/Server/index.ts` multer config
- `src/Server/RequestHandlers/post-files.ts`
- `src/Server/RequestHandlers/get-sheets.ts`
- `src/Client/Model/Sheet.ts` if the display name and the file name need to differ

## Approach

- In `diskStorage.filename`, ignore `file.originalname` for the path. Use `crypto.randomUUID()` plus a mapped extension.
- Return both `originalName` and `savedAs` in the upload response. `GET /sheets` returns `name` as the original name when it can, and the file id as the lookup key.
- If preserving the original name across restarts requires a sidecar, write `uploads/index.json` as `{ id, originalName, file }[]` through the existing JSON helpers. Do not encode the original name into the path.

## Acceptance

- [ ] Uploading `a.png` twice leaves two files and two list entries.
- [ ] A multipart filename of `../outside.png` does not create a file outside `uploads/`.
- [ ] The list still shows `a.png` as the label.

## Test plan

- `curl -F` the same PNG twice and `ls uploads`. `curl -F` with a traversal name and confirm no file appeared in the parent directory.
