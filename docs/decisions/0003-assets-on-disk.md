# Pixels are files, structure is JSON

## Status

Accepted.

## Decision

Sprite sheets, metatile renders, and portraits are files under the project, named by id. JSON stores ids and rectangles. JSON does not store base64 image payloads.

## Why

`placement-images.json` and `GET /sheets` already inline whole images. A town's worth of fill bitmaps will make the file unreadable, slow to save, and easy to corrupt. Git and backups cannot diff a data URL.

## Consequences

- Uploads are copied to an id-based filename with an allow-listed extension.
- The client loads an image by URL, not by receiving the bytes inside a document.
- Deleting a metatile does not require rewriting every map's image data.
