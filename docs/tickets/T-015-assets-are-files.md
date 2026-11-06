---
id: T-015
title: Serve sheet images as files
status: done
priority: P1
phase: 1
type: feat
area: server
depends_on: [T-009, T-013]
blocks: [T-019]
---

# T-015 Serve sheet images as files

## Outcome

A sheet is fetched by URL. Project JSON and the sheet list contain an id and a URL, never a base64 payload. Existing uploads still open.

## Result

`GET /assets/:file` (`Server/RequestHandlers/get-asset.ts`) sends one stored file after checking the name is a bare filename with an allow-listed image extension, so `index.json` and `../` are refused with 404. `domain/asset-url.ts` builds the URL for both sides. `GET /sheets` no longer reads any file; `imageSrc` is the asset URL. `Server/services/image-mime.ts` went away with the base64 path. Verified by uploading a generated PNG, fetching it byte-identical from the URL, and opening it in the sheet window.

## Why

docs/decisions/0003-assets-on-disk.md. `GET /sheets` currently inlines every file.

## Scope

In:

- Static serving of the upload directory under `/assets/<id>`.
- `Sheet.imageSrc` becomes a URL path.
- The editor displays sheets from that URL.

Out:

- Repacking old placement data URLs. Those die with T-020. New features must not add more of them.

## Touch

- `src/Server/index.ts`
- `src/Server/RequestHandlers/get-sheets.ts`
- `src/Client` sheet viewer, which already loads `imageSrc` through `Dom.image`

## Approach

- Reuse the uuid filenames from T-009. The static middleware serves the directory. Do not reflect the original name in the URL.
- Keep `originalName` in the index sidecar for the label.

## Acceptance

- [x] `GET /sheets` JSON is small and contains no `data:` prefix.
- [x] Opening a sheet still draws the image.
- [x] A direct GET of the asset URL returns the bytes.

## Test plan

- Curl `/sheets` and one asset URL. Open the importer in the browser.
