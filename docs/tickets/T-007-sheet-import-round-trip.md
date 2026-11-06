---
id: T-007
title: Make sprite sheet import open the file that was uploaded
status: done
priority: P0
phase: 0
type: bug
area: editor
depends_on: [T-009]
blocks: [T-019]
---

# T-007 Make sprite sheet import open the file that was uploaded

## Outcome

Dropping a PNG into the importer uploads it, lists it, and Open shows that image. A second open uses the server copy. JPEG opens as `image/jpeg`.

Done in commit `fix(editor): open the sheet that was uploaded (T-007)`. `FileListing` owns the upload gesture: it awaits `FileUpload.uploadMultiple` (which rejects on a non-ok response), calls `sheetRepository.refresh()`, and re-renders from the server list; a failed upload shows the server's message in the list. `open-sheet` carries the sheet id and `WorldEditor` uses `getById`, which returns `undefined` and opens nothing. `GET /sheets` reads files asynchronously and takes the MIME type from `imageMimeType` (`src/Server/services/image-mime.ts`, with a node test). Uploads with a disallowed extension are refused by a multer `fileFilter` and answered 400; a zero-byte file discards the batch with a 400. `.gif` joined the allow list.

## Why

The listing paints a local data URL immediately, but Open looks up `sheetRepository`, which was filled once at startup and never refreshed. `getByName` can return undefined and `sheet.name` throws. `get-sheets.ts` labels JPEG as `image/jpg` and reads every file with `readFileSync`. See docs/problems.md items 3 and 12.

## Scope

In:

- After a successful upload, the sheet list reloads from the server.
- Open uses a sheet that exists in that list.
- MIME types for png, jpeg, gif, webp are correct. SVG stays allowed only if it already was.
- `GET /sheets` does not block the process on a synchronous read of every byte. Streaming a URL is the durable fix and belongs to T-015; this ticket may keep base64 but must read asynchronously and set the MIME from a map, not from the raw extension.

Out:

- Moving bytes out of JSON (T-015).
- The tileset palette (T-019).

## Touch

- `src/Server/RequestHandlers/get-sheets.ts`
- `src/Client/Service/FileUpload.ts`
- `src/Client/Service/Repository/SheetRepository.ts`
- `src/Client/Component/SheetListing/SheetListing.ts`
- `src/Client/Component/WorldEditor.ts`

## Approach

- A MIME map: `.jpg` and `.jpeg` → `image/jpeg`, `.png` → `image/png`, `.gif` → `image/gif`, `.webp` → `image/webp`.
- `FileUpload.uploadMultiple` resolves only when the response is ok, then the repository refetches.
- `getByName` returns `Sheet | undefined`. The opener does nothing visible-bad if the name is missing: leave the window closed. Do not throw.
- Reject zero-byte files and extensions outside the allow list at upload time, with a 400.

## Acceptance

- [x] Upload a PNG, click Open, the sheet window shows that picture.
- [x] Reload the editor, Open still shows it.
- [x] A `.jpg` response uses `image/jpeg`.
- [x] Uploading a `.txt` is rejected and does not appear in the list.

## Test plan

- Manual with one PNG and one JPEG. `curl -F` a text file and expect 400.
