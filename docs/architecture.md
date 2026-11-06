# Architecture today

The program is a local editor plus a play page. Both are webpack bundles. An Express process serves them and stores JSON on disk. There is one local project in `data/project.json` holding many maps; the editor and play page open one map at a time, chosen by `?map=<id>`. `src/engine` draws a map; both pages call it.

```
src/
  Client/     browser UI and the play page
  domain/     pure types and rules: coordinates, grid, rect, ids, project, tileset, map (metatile grids, collision, elevation). No DOM, no Express.
  engine/     renderFrame over a DrawPort, Scene, and the frame loop. No DOM; the browser adapts a canvas context.
  Model/      shared types: the read-only legacy placement model, user data, sprite sketches
  Server/     Express routes and JSON files
public/       index.html, play.html, built bundles in dist/
data/         created at runtime: project.json (maps, tile grids, legacy layers), placement images (read-only), user data, sprite models
uploads/      sprite sheet files, stored as <uuid><ext>, plus index.json with the original names
```

`npm run build` compiles both bundles, `npm start` runs Express, `npm run typecheck` runs `tsc --noEmit`, and `npm test` runs `node --test` over `src/**/*.test.ts`. See the root README.

## Boot

Editor (`public/index.html` → `src/Client/index.ts`):

1. Register every custom element in `Client/Constants/components.ts`.
2. On `DOMContentLoaded`, append an `<ide-wrapper>`.
3. `Ide` paints a menu bar (the items do nothing) and a `WorldEditor`.
4. `WorldEditor.setup` loads the project, picks the active map (`Client/Service/active-map.ts`: `?map=` if it exists, else the first map), opens it in `mapSession`, then loads user data and sheets.
5. `WorldEditor.build` mounts the side menu (with `MapSelect`, a select plus a "+ Map" button that reloads the page on the chosen map, and `LayerListing`), the tool bar, one `MapCanvas`, and always opens a dialog window. `MapCanvas.setup` decodes the sheets and the map's legacy placements.

Play (`public/play.html` → `src/Client/play.ts`):

1. Load the project, pick the active map the same way the editor does, and decode every sheet and that map's legacy placements (`Client/Service/load-legacy-placements.ts`).
2. `buildScene` and `renderFrame` on one canvas from a camera offset, inside `engine/loop.ts`.
3. Held arrow keys pan that offset every frame at 120 px/s. There is no player and no collision.

## UI model

`Client/Service/Component.ts` is the in-repo element base (T-018). Components implement `setup`, `build`, `css`, and optionally `afterBuild`; `listeners` maps `'selector:event'` to handlers inside the shadow root and `externalListeners` maps bus event names to handlers, which are removed when the element disconnects. `patch()` replaces the built tree and rebinds local listeners. `Dom.makeComponent(Ctor, dataset)` encodes non-string values as JSON onto the element; `parsedDataset` (`Client/Service/parse-dataset.ts`) decodes them back, typed by the component's `Component<TDataset>` parameter. `componentId(Ctor)` is the tag name and keys the saved window rectangles.

Cross-component talk is a global string bus, `Client/Service/Events.ts`. Names are not catalogued in code. The ones in use:

| Event | Emitter | Listener | Payload |
| --- | --- | --- | --- |
| `window-resize` | `index.ts` | `Canvas2D` | none |
| `upload-files-submission` | `FileUploader` | `FileListing` | `File[]` |
| `open-sheet` | `FileListing` | `WorldEditor` | sheet id |
| `window-destroyed` | `WindowBox` | `WorldEditor` | title string |
| `mouse-down-window-box` | `WindowBox` | `WorldEditor` | the window element |
| `open-sheet-importer` | `SideMenu` | `WorldEditor` | none |
| `open-add-new-layer` | `LayerListing` | `WorldEditor` | none |
| `click-open-new-model` | `SideMenu` | `WorldEditor` | none (handler empty) |
| `new-layer-submit` | `NewLayerForm` | `LayerListing` | `{ name, kind }` |
| `updated-view-coordinates` | `MapCanvas` | `WorldEditor` | `Coordinates` |
| `window-update` | `WindowBox` | `WorldEditor` | `WindowConfiguration` |
| `tool-selection` | `CanvasTools` | `MapCanvas` | `Tool` (`Client/Service/tool.ts`: pencil, fill, rect, rubber) |
| `map-session-changed` | `Client/Service/map-session.ts` | `MapCanvas`, `LayerListing` | none |
| `close-modal` | `NewLayerForm` | `BasicModal` | the form element |
| `open-tileset-palette` | `SheetViewer`, `SideMenu` | `WorldEditor` | tileset id, or none for the active map's tileset |
| `brush-changed` | `Client/Service/brush.ts` | `TilesetPalette` | `Brush` |

The current brush is `Client/Service/brush.ts`: `{ tilesetId, metatileId }` or `null`, held in editor state, never a bitmap. `TilesetPalette` (`Client/Component/Tileset/`) draws one tileset's sheet on the 16 grid, tints solid metatiles red, outlines the selected one, sets the brush on click, and toggles `solid` through `projectRepository.setMetatileAttributes`. `SheetViewer`'s "Use as tileset" button reuses the tileset already sliced from that sheet or calls `sliceSheet` and `POST /project/tilesets`, then opens the palette.

`WorldEditor` opens windows and persists view state; map edits do not go through it. `Client/Service/map-session.ts` is the open map plus editor-only state (active tile layer, hidden layers). Tools and the layer listing compute the next grid with a pure `domain/map.ts` function (`withTile`, `withRect`, `floodFill`, `addTileLayer`, `removeTileLayer`, `renameTileLayer`, `moveTileLayer`), call `mapSession.update` (live, during a drag) and `mapSession.save` (once, at the end) or `commit` (both), and every listener re-reads the session on `map-session-changed`.

## Data on disk

| File | Written by | Shape |
| --- | --- | --- |
| `data/project.json` | project, map, tileset, and tile-map routes | `{ id, name, tilesets: Tileset[], maps: { id, name, tileMap: TileMap, layers: Layer[] }[] }`; `layers` is the read-only legacy placement list |
| `data/layers.json` | nothing any more | imported once into a map named "Legacy map" when `project.json` is first created, then ignored |
| `data/placement-images.json` | `GET /placement-images` only | `{ uuid, src }[]` where `src` is a data URL; nothing appends to it since T-020 |
| `data/user-data.json` | user-data route | camera, tool name, window rects |
| `data/sprite-models.json` | sprite-model route | unused by the client |
| `uploads/<uuid><ext>` | `multer` | the sheet bytes |
| `uploads/index.json` | upload route | `{ id, originalName, file }[]` |

`Project` and `GameMap` live in `domain/project.ts` with pure helpers (`addMap`, `renameMap`, `withMapLayers`, `findMap`). `Server/services/project-store.ts` reads and writes the file; handlers call a domain helper and write the result. `withProjectDefaults` fills fields an older file lacks, and boot writes the result back once.

A map's grid is a `TileMap` (`domain/map.ts`): `width` and `height` in cells, a `tilesetId`, `layers: TileLayer[]` back to front (each a dense row-major `MetatileId[]` with `kind: 'ground' | 'overhead'`), and `attributes` (`collision[]`, `elevation[]` on the same index). A `Tileset` (`domain/tileset.ts`) maps ids to a `sheetId` plus a pixel rectangle and the defaults `solid`, `elevation`, `ledge`. Id 0 is the empty cell and is never solid. `isBlocked(map, tileset, to, from?)` is the movement rule: outside, painted collision, or any solid metatile blocks; with `from`, a change between two non-zero elevations blocks. Tilesets are sliced from a sheet (`sliceSheet`, T-019) and edited through the palette. The editor's tools write metatile ids into the active `TileLayer` (T-020); a map without a tileset adopts the brush's tileset on the first stroke, and a brush from a different tileset is refused. `isTileMap` is the server's structural check on a saved grid.

A legacy placement layer (`Model/Layer.ts`) is:

```ts
{
  uuid, type, name, created_at, is_visible, is_active, order,
  placements: { uuid, coordinate: { x, y }, imageUuid }[]
}
```

Since T-020 nothing writes placements. A map painted before metatiles keeps them and both pages draw them as a frozen background under the tile layers; they cannot be edited or deleted from the UI. `type` is kept as text and ignored. See [decisions/0001-tile-grid.md](decisions/0001-tile-grid.md) and [decisions/0003-assets-on-disk.md](decisions/0003-assets-on-disk.md).

### Persisted names that do not follow the standard

These field names are on disk and in the types that read them. New fields are camelCase. These stay as they are until the ticket that retires their file migrates them in the same change.

| File | Field | Should be | Retired by |
| --- | --- | --- | --- |
| `data/project.json` (`maps[].layers`) | `created_at`, `is_visible`, `is_active` | `createdAt`, `isVisible`, `isActive` | the legacy list is read-only since T-020; drop it when no map still carries placements |
| `data/project.json` (`maps[].layers`) | `type: 'player_controlled'` | an object event, not a layer | T-026 |
| `data/user-data.json` | `componentConfigration` | `componentConfiguration` | T-036 (the window config is only read for the dialog stub) |

## Draw path

`engine/render.ts` `renderFrame(port, scene, camera)` is the only code that draws a map. A `Scene` (`engine/scene.ts`) is the tile map (hidden layers already left out), its tileset, decoded sheets by id, and the legacy placement layers sorted back to front. A `DrawPort` (`engine/draw-port.ts`) is clear plus draw-image-region; `Client/Service/canvas-draw-port.ts` adapts a `CanvasRenderingContext2D` with smoothing off. Legacy placements draw first as a frozen background (back to front; a **lower** `order` paints **in front**, via `Model/draw-order.ts`), then tile layers back to front. Cells and placements outside the view are culled.

Editor: `MapCanvas` is one element with one `<canvas>` and one `engine/loop.ts` loop. It builds the scene with `Client/Service/build-scene.ts` from `mapSession.visibleTileMap()` and marks it stale on `map-session-changed`. The pointer always lands on it: pencil and rubber call `withTile` per pointer sample and save on mouseup, rectangle previews a span and calls `withRect` on mouseup, fill calls `floodFill` (bounded by the map, not the view) and saves at once. The brush is a metatile id; a one-cell ghost canvas previews it. The middle button pans the shared `camera`.

Play: `play.ts` builds a scene once and runs the same loop and `renderFrame`.

`Canvas2D` remains only because the unregistered `SpriteModelMaker` sketch references it; nothing on a page uses it.

## HTTP

| Method | Path | Role |
| --- | --- | --- |
| GET | `/` | editor HTML |
| GET | `/play` | play HTML |
| GET | `/sheets` | `{ id, name, file, imageSrc }[]`; `imageSrc` is `/assets/<file>`, never a data URL |
| GET | `/assets/:file` | the bytes of one stored sheet; bare filename with an allow-listed extension only |
| GET | `/project` | the project with every map, its grid, and its legacy layers |
| POST | `/project/maps` | `{ name }` → the new map |
| PATCH | `/project/maps/:mapId` | `{ name }` → the renamed map |
| POST | `/project/tilesets` | `{ name, metatiles }` → the new tileset (ids and rectangles only, no pixels) |
| PATCH | `/project/tilesets/:tilesetId/metatiles/:metatileId` | `{ solid?, elevation?, ledge? }` → the updated tileset |
| PUT | `/project/maps/:mapId/tileset` | `{ tilesetId }` → the updated map |
| PUT | `/project/maps/:mapId/tile-map` | a whole `TileMap` (checked by `isTileMap`) → the updated map; sent after every stroke and layer edit |
| GET/PATCH | `/user-data` | camera, tool, windows |
| GET | `/placement-images` | data URLs for legacy placements; read-only |
| POST | `/upload-files` | `multer`, filename = uuid + allow-listed extension |
| POST | `/sprite-model` | append to a file the client never reads |

JSON reads and writes are synchronous. `writeJson` writes a `.tmp` sibling and renames it over the target, so a reader never sees a torn document. It does not lock: two overlapping PATCHes still race on read-modify-write (last write wins), which one server process and one editor tab keep rare.

## Sketches that are not features

These files are intentions, not behavior. Do not wire them up half-way inside a bugfix. They get real designs in later tickets.

| File | State |
| --- | --- |
| `Model/Dialog.ts`, `Component/Dialog/DialogCreator.ts` | A textarea and an "add reply" button. Not saved. The window opens on every editor load. |
| `Model/AnimatedSprite.ts` | Walk and idle frame lists. Nothing reads them. |
| `Model/SpriteModel.ts`, `SpriteModelMaker.ts` | Maker is not a registered element. Side-menu handler is empty. |
| `Component/Animation/AnimationMaker.ts` | Empty container. Registered, never opened. |
| `Model/Skill.ts` | `{ uuid }` only. |

## Target shape

This is the direction. It is not a request to move every file in one change. Tickets T-012 through T-018 do it in slices.

```
src/
  domain/     types and pure rules: maps, collision, warps, flags, inventory
  engine/     loop, input, camera, actors, drawing against a small canvas port
  editor/     custom elements that call domain and engine
  server/     HTTP and the file store
```

`domain/` and most of `engine/` must run under `node` tests with no browser. Drawing takes an interface the browser implements with a `CanvasRenderingContext2D`.

## Persistence target

One project directory, chosen explicitly, containing JSON for structure and binary files for pixels. The editor can still be single-user and local. It cannot keep storing the pictures inside the structure. See [decisions/0003-assets-on-disk.md](decisions/0003-assets-on-disk.md).
