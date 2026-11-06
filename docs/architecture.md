# Architecture today

The program is a local editor plus a play page. Both are webpack bundles. An Express process serves them and stores JSON on disk. There is one local project in `data/project.json` holding many maps; the editor and play page open one map at a time, chosen by `?map=<id>`. `src/engine` draws a map; both pages call it.

```
src/
  Client/     browser UI and the play page
  domain/     pure types and rules: coordinates, grid, rect, ids, project, tileset, map (metatile grids, collision, elevation). No DOM, no Express.
  engine/     renderFrame over a DrawPort, Scene, and the frame loop. No DOM; the browser adapts a canvas context.
  Model/      shared types for the placement model (some are unused sketches)
  Server/     Express routes and JSON files
public/       index.html, play.html, built bundles in dist/
data/         created at runtime: project.json (maps and their layers), placement images, user data, sprite models
uploads/      sprite sheet files, stored as <uuid><ext>, plus index.json with the original names
```

`npm run build` compiles both bundles, `npm start` runs Express, `npm run typecheck` runs `tsc --noEmit`, and `npm test` runs `node --test` over `src/**/*.test.ts`. See the root README.

## Boot

Editor (`public/index.html` → `src/Client/index.ts`):

1. Register every custom element in `Client/Constants/components.ts`.
2. On `DOMContentLoaded`, append an `<ide-wrapper>`.
3. `Ide` paints a menu bar (the items do nothing) and a `WorldEditor`.
4. `WorldEditor.setup` loads the project, picks the active map (`Client/Service/active-map.ts`: `?map=` if it exists, else the first map), points `layerRepository.useMap` at it, then loads user data, that map's layers, sheets, and placement images, and decodes every placement into `loadedPlacementRepository`.
5. `WorldEditor.build` mounts the side menu (with `MapSelect`, a select plus a "+ Map" button that reloads the page on the chosen map), the tool bar, one `MapCanvas`, and always opens a dialog window.

Play (`public/play.html` → `src/Client/play.ts`):

1. Load the project, pick the active map the same way the editor does, and decode that map's placement images and every sheet.
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
| `open-add-player` | `LayerListing` | `WorldEditor` | none |
| `click-open-new-model` | `SideMenu` | `WorldEditor` | none (handler empty) |
| `click-open-history` | `SideMenu` | `WorldEditor` | none |
| `new-layer-submit` | `NewLayerForm` | `WorldEditor` | `{ name, type }` |
| `layer-placement-made` | `MapCanvas` | `WorldEditor` | `Layer` |
| `layer-active` | `LayerItem` | `WorldEditor` | `Layer` |
| `layer-visible-toggle` | `LayerItem` | `WorldEditor` | `Layer` |
| `layer-delete` | `LayerItem` | `WorldEditor` | uuid |
| `layer-deleted` | `WorldEditor` | `MapCanvas`, `LayerItem` | uuid |
| `updated-view-coordinates` | `MapCanvas` | `WorldEditor` | `Coordinates` |
| `window-update` | `WindowBox` | `WorldEditor` | `WindowConfiguration` |
| `request-placement-deletion` | `PlacementHistory` | `WorldEditor` | uuid |
| `placement-removed` | `WorldEditor` | `MapCanvas` | uuid |
| `layer-order-up` / `layer-order-down` | `LayerItem` | `WorldEditor` | uuid |
| `layers-created` | `LayerRepository` | `LayerListing`, `MapCanvas` | `Layer[]` |
| `layer-changed` | `LayerRepository` | `MapCanvas`, `LayerItem` | `{ uuid, changed }` |
| `sheet-selection-made` | `SheetViewer` | `MapCanvas` | `HTMLImageElement` |
| `tool-selection` | `CanvasTools` | `MapCanvas` | tool name |
| `request-focus-on-placement` | `PlacementHistory` | `MapCanvas` | uuid |
| `placement-added` | `MapCanvas` | `PlacementHistory` | none |
| `close-modal` | `NewLayerForm` | `BasicModal` | the form element |
| `open-tileset-palette` | `SheetViewer`, `SideMenu` | `WorldEditor` | tileset id, or none for the active map's tileset |
| `brush-changed` | `Client/Service/brush.ts` | `TilesetPalette` | `Brush` |

The current brush is `Client/Service/brush.ts`: `{ tilesetId, metatileId }` or `null`, held in editor state, never a bitmap. `TilesetPalette` (`Client/Component/Tileset/`) draws one tileset's sheet on the 16 grid, tints solid metatiles red, outlines the selected one, sets the brush on click, and toggles `solid` through `projectRepository.setMetatileAttributes`. `SheetViewer`'s "Use as tileset" button reuses the tileset already sliced from that sheet or calls `sliceSheet` and `POST /project/tilesets`, then opens the palette.

`WorldEditor` subscribes to most of these and is the de facto application object. New behavior should not land there. Give it a home in the domain or in the component that owns the interaction.

## Data on disk

| File | Written by | Shape |
| --- | --- | --- |
| `data/project.json` | project, map, and layer routes | `{ id, name, tilesets: Tileset[], maps: { id, name, tileMap: TileMap, layers: Layer[] }[] }` |
| `data/layers.json` | nothing any more | imported once into a map named "Legacy map" when `project.json` is first created, then ignored |
| `data/placement-images.json` | placement-image route | `{ uuid, src }[]` where `src` is a data URL |
| `data/user-data.json` | user-data route | camera, tool name, window rects |
| `data/sprite-models.json` | sprite-model route | unused by the client |
| `uploads/<uuid><ext>` | `multer` | the sheet bytes |
| `uploads/index.json` | upload route | `{ id, originalName, file }[]` |

`Project` and `GameMap` live in `domain/project.ts` with pure helpers (`addMap`, `renameMap`, `withMapLayers`, `findMap`). `Server/services/project-store.ts` reads and writes the file; handlers call a domain helper and write the result. `withProjectDefaults` fills fields an older file lacks, and boot writes the result back once.

A map's grid is a `TileMap` (`domain/map.ts`): `width` and `height` in cells, a `tilesetId`, `layers: TileLayer[]` back to front (each a dense row-major `MetatileId[]` with `kind: 'ground' | 'overhead'`), and `attributes` (`collision[]`, `elevation[]` on the same index). A `Tileset` (`domain/tileset.ts`) maps ids to a `sheetId` plus a pixel rectangle and the defaults `solid`, `elevation`, `ledge`. Id 0 is the empty cell and is never solid. `isBlocked(map, tileset, to, from?)` is the movement rule: outside, painted collision, or any solid metatile blocks; with `from`, a change between two non-zero elevations blocks. Tilesets are sliced from a sheet (`sliceSheet`, T-019) and edited through the palette; nothing paints metatiles onto a map yet (T-020).

A layer is:

```ts
{
  uuid, type, name, created_at, is_visible, is_active, order,
  placements: { uuid, coordinate: { x, y }, imageUuid }[]
}
```

`type` is `image`, `collision`, or `player_controlled`. Collision is still an image placement (a translucent red square). The `CollisionsLayer` type is unused. `player_controlled` is a blue circle the user stamps by hand. Play mode reads `type` and ignores it.

Images live inline in JSON. Until T-008 a fill merged a region into one new data URL; it now writes one placement per cell, but the model is still retired rather than extended. See [decisions/0001-tile-grid.md](decisions/0001-tile-grid.md) and [decisions/0003-assets-on-disk.md](decisions/0003-assets-on-disk.md).

### Persisted names that do not follow the standard

These field names are on disk and in the types that read them. New fields are camelCase. These stay as they are until the ticket that retires their file migrates them in the same change.

| File | Field | Should be | Retired by |
| --- | --- | --- | --- |
| `data/layers.json` | `created_at`, `is_visible`, `is_active` | `createdAt`, `isVisible`, `isActive` | T-020 (placement layers are replaced by metatile layers) |
| `data/layers.json` | `type: 'player_controlled'` | an object event, not a layer | T-026 |
| `data/user-data.json` | `componentConfigration` | `componentConfiguration` | T-036 (the window config is only read for the dialog stub) |

## Draw path

`engine/render.ts` `renderFrame(port, scene, camera)` is the only code that draws a map. A `Scene` (`engine/scene.ts`) is the tile map, its tileset, decoded sheets by id, and the visible legacy placement layers already sorted back to front. A `DrawPort` (`engine/draw-port.ts`) is clear plus draw-image-region; `Client/Service/canvas-draw-port.ts` adapts a `CanvasRenderingContext2D` with smoothing off. Tile layers draw back to front, then placement layers back to front (a **lower** `order` paints **in front**, via `Model/draw-order.ts`). Cells and placements outside the view are culled.

Editor: `MapCanvas` is one element with one `<canvas>` and one `engine/loop.ts` loop. It builds the scene with `Client/Service/build-scene.ts` and marks it stale on `layers-created`, `layer-changed`, `layer-deleted`, `placement-removed`, and after each stroke step. The pointer always lands on it; pencil, fill, and rubber (`Client/Service/placement-painter.ts`) act on the layer whose `is_active` is set, the middle button pans the shared `camera`, and a collision layer always paints the translucent red marker.

Play: `play.ts` builds a scene once and runs the same loop and `renderFrame`.

`Canvas2D` remains only because the unregistered `SpriteModelMaker` sketch references it; nothing on a page uses it.

`loadedPlacementRepository` is an in-memory list of decoded images filled once by `WorldEditor.setup`.

## HTTP

| Method | Path | Role |
| --- | --- | --- |
| GET | `/` | editor HTML |
| GET | `/play` | play HTML |
| GET | `/sheets` | `{ id, name, file, imageSrc }[]`; `imageSrc` is `/assets/<file>`, never a data URL |
| GET | `/assets/:file` | the bytes of one stored sheet; bare filename with an allow-listed extension only |
| GET | `/project` | the project with every map and its layers |
| POST | `/project/maps` | `{ name }` → the new map |
| PATCH | `/project/maps/:mapId` | `{ name }` → the renamed map |
| POST | `/project/tilesets` | `{ name, metatiles }` → the new tileset (ids and rectangles only, no pixels) |
| PATCH | `/project/tilesets/:tilesetId/metatiles/:metatileId` | `{ solid?, elevation?, ledge? }` → the updated tileset |
| PUT | `/project/maps/:mapId/tileset` | `{ tilesetId }` → the updated map |
| GET/POST/PATCH | `/maps/:mapId/layers` | one map's layers |
| DELETE | `/maps/:mapId/layers/:uuid` | remove a layer from one map |
| GET/PATCH | `/user-data` | camera, tool, windows |
| GET/POST | `/placement-images` | data URLs |
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
