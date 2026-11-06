# Architecture today

The program is a local editor plus a play page. Both are webpack bundles. An Express process serves them and stores JSON on disk. There is one local project in `data/project.json` holding many maps; the editor and play page open one map at a time, chosen by `?map=<id>`. `src/engine` draws a map; both pages call it.

```
src/
  Client/     browser UI and the play page
  domain/     pure types and rules: coordinates, grid, rect, ids, project, tileset, map (metatile grids, collision, elevation), movement (the player's cell-to-cell step), collision (what a step may enter), connection (seams between map edges), sprite (idle and walk frames per direction), history (undo stack). No DOM, no Express.
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
5. `WorldEditor.build` mounts the side menu (with `MapSelect` — switch, create, rename, resize, delete; switching and creating reload the page on the chosen map — and `LayerListing`), the tool bar, one `MapCanvas`, and always opens a dialog window. A project with no maps shows an empty state with only the map list. `MapCanvas.setup` decodes the sheets and the map's legacy placements.

Play (`public/play.html` → `src/Client/play.ts`):

1. Load the project and open the session map: `?map=<id>` when the editor's play button asked to try a map, else the start map (`startMap`: `startMapId` when set, else the first map). No maps at all shows a plain message instead of the canvas. Decode every sheet and that map's legacy placements (`Client/Service/load-legacy-placements.ts`).
2. `buildScene` and `renderFrame` on one canvas inside `engine/loop.ts`. The canvas is the 240×160 GBA view at the largest whole scale that fits the window (`engine/camera.ts` `integerScale`), centred on a black body that acts as the letterbox; `cameraFor` keeps the player centred and clamps at the map edge, centring a map smaller than the view.
3. The player starts on the map's `spawn` cell. Held arrow or WASD keys step them cell to cell (`domain/movement.ts`); Shift or X runs. The camera follows. `domain/collision.ts` `canStep` decides what a step may enter (edge, solid, elevation, ledges); a map with no tileset falls back to the edge rule.

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
| `open-sprite-editor` | `SideMenu` | `WorldEditor` | sprite id, or none for the first sprite |
| `new-layer-submit` | `NewLayerForm` | `LayerListing` | `{ name, kind }` |
| `updated-view-coordinates` | `MapCanvas` | `WorldEditor` | `View` (after a pan or zoom) |
| `grid-toggled` | `MapCanvas` | `WorldEditor` | boolean |
| `window-update` | `WindowBox` | `WorldEditor` | `WindowConfiguration` |
| `tool-selection` | `CanvasTools` | `MapCanvas` | `Tool` (`Client/Service/tool.ts`: pencil, fill, rect, rubber) |
| `map-session-changed` | `Client/Service/map-session.ts` | `MapCanvas`, `LayerListing` | none |
| `close-modal` | `NewLayerForm`, `ConfirmDialog`, `MapSizeForm`, `MapConnectionsForm` | `BasicModal` | the form element |
| `map-connections-submit` | `MapConnectionsForm` | `MapSelect` | `Connections` |
| `confirmed` | `ConfirmDialog` | `MapSelect` | the topic string the dialog was opened with |
| `map-size-submit` | `MapSizeForm` | `MapSelect` | `GridSize` |
| `open-tileset-palette` | `SheetViewer`, `SideMenu` | `WorldEditor` | tileset id, or none for the active map's tileset |
| `brush-changed` | `Client/Service/brush.ts` | `TilesetPalette` | `Brush` |

The current brush is `Client/Service/brush.ts`: `{ tilesetId, metatileId }` or `null`, held in editor state, never a bitmap. `TilesetPalette` (`Client/Component/Tileset/`) draws one tileset's sheet on the 16 grid, tints solid metatiles red, outlines the selected one, sets the brush on click, and toggles `solid` through `projectRepository.setMetatileAttributes`. `SheetViewer`'s "Use as tileset" button reuses the tileset already sliced from that sheet or calls `sliceSheet` and `POST /project/tilesets`, then opens the palette.

`WorldEditor` opens windows and persists view state; map edits do not go through it. `Client/Service/map-session.ts` is the open map plus editor-only state: the paint target (a tile layer, the collision grid, or the elevation grid), the elevation the pencil writes, which layers and overlays are hidden, and the undo history (`domain/history.ts`, a pure capped stack of `TileMap` snapshots). The first `update` after a `save` remembers the grid it replaced; `save` records that snapshot as one undo step, so a whole drag is one step. `undo`/`redo` restore a snapshot and save it; `MapCanvas` binds Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z (or Y) outside text fields. Tools and the layer listing compute the next grid with a pure `domain/map.ts` function (`withTile`, `withRect`, `floodFill`, `addTileLayer`, `removeTileLayer`, `renameTileLayer`, `moveTileLayer`), call `mapSession.update` (live, during a drag) and `mapSession.save` (once, at the end) or `commit` (both), and every listener re-reads the session on `map-session-changed`.

## Data on disk

| File | Written by | Shape |
| --- | --- | --- |
| `data/project.json` | project, map, tileset, tile-map, and sprite routes | `{ id, name, tilesets: Tileset[], sprites: SpriteDefinition[], playerSpriteId, startMapId, maps: { id, name, tileMap: TileMap, spawn: Cell, connections: { north?, south?, east?, west? }, layers: Layer[] }[] }`; `layers` is the read-only legacy placement list |
| `data/layers.json` | nothing any more | imported once into a map named "Legacy map" when `project.json` is first created, then ignored |
| `data/placement-images.json` | `GET /placement-images` only | `{ uuid, src }[]` where `src` is a data URL; nothing appends to it since T-020 |
| `data/user-data.json` | user-data route | camera, tool name, window rects |
| `data/sprite-models.json` | nothing (the route went in T-027) | delete it when convenient |
| `uploads/<uuid><ext>` | `multer` | the sheet bytes |
| `uploads/index.json` | upload route | `{ id, originalName, file }[]` |

`Project` and `GameMap` live in `domain/project.ts` with pure helpers (`addMap`, `renameMap`, `withMapLayers`, `withMapSpawn`, `withStartMap`, `startMap`, `findMap`). `startMapId` (T-030) is where play begins; `MapSelect`'s flag button sets or clears it, and deleting that map clears it. A map's `connections` (T-031, `domain/connection.ts`) are seams by edge: `{ mapId, offset }`, the offset in cells along the edge added to this map's coordinate (north with offset 3 lines this map's x=0 up with the neighbour's x=3). `crossEdge(size, connections, to, sizeOf)` turns an out-of-bounds step into the neighbour's landing cell (the opposite edge's row or column), or undefined when there is no seam, the neighbour is gone, or the landing cell is off it. `MapSelect`'s link button opens `MapConnectionsForm` for the four edges and turns red when a seam points at a deleted map. A `GameMap` carries a `spawn` cell (T-026) that defaults to the grid centre and snaps back there when a resize leaves it outside. `Server/services/project-store.ts` reads and writes the file; handlers call a domain helper and write the result. `withProjectDefaults` fills fields an older file lacks, and boot writes the result back once.

A map's grid is a `TileMap` (`domain/map.ts`): `width` and `height` in cells, a `tilesetId`, `layers: TileLayer[]` back to front (each a dense row-major `MetatileId[]` with `kind: 'ground' | 'overhead'`), and `attributes` (`collision[]`, `elevation[]`, `ledge[]` on the same index; `ledge` is stored since T-022 and enforced by `domain/collision.ts` since T-028). A `Tileset` (`domain/tileset.ts`) maps ids to a `sheetId` plus a pixel rectangle and the defaults `solid`, `elevation`, `ledge`. Id 0 is the empty cell and is never solid. `isBlocked(map, tileset, to, from?)` is the movement rule: outside, painted collision, or any solid metatile blocks; with `from`, a change between two non-zero elevations blocks. Tilesets are sliced from a sheet (`sliceSheet`, T-019) and edited through the palette. The editor's tools write metatile ids into the active `TileLayer` (T-020); a map without a tileset adopts the brush's tileset on the first stroke, and a brush from a different tileset is refused. `isTileMap` is the server's structural check on a saved grid; `withTileMapDefaults` adds arrays an older file lacks; `resizeGrid`/`resizeTileMap` re-lay every layer and attribute grid for a new size, anchored top-left. Attribute painting (T-022) goes through `withCollision`/`withElevation` with the generic `withCell`, `withCellsRect`, and `floodFillCells`; `attributesAt` reads one cell. Painting an attribute never touches a picture layer.

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
| `data/project.json` (`maps[].layers`) | `type: 'player_controlled'` | nothing; `maps[].spawn` replaced it in T-026 | drop with the legacy list |
| `data/user-data.json` | `componentConfigration` | `componentConfiguration` | T-036 (the window config is only read for the dialog stub) |

## Draw path

`engine/render.ts` `renderFrame(port, scene, view)` is the only code that draws a map. A `View` (`engine/view.ts`) is the camera position in world pixels plus an integer `zoom` (1–4); `worldToScreen`/`screenToWorld` are the only two conversion formulas, and `zoomedAt` changes zoom while keeping the world point under a screen anchor still. A `Scene` (`engine/scene.ts`) is the tile map (hidden layers already left out), its tileset, decoded sheets by id, and the legacy placement layers sorted back to front. A `DrawPort` (`engine/draw-port.ts`) is clear, fill-rect, and draw-image-region; `Client/Service/canvas-draw-port.ts` adapts a `CanvasRenderingContext2D` with smoothing off. Passes are fixed (T-023): legacy placements as a frozen background (back to front; a **lower** `order` paints **in front**, via `Model/draw-order.ts`), then `ground` tile layers in list order, then the actors passed to `renderFrame`, then `overhead` tile layers. An `Actor` (`engine/scene.ts`) is a world rectangle with an optional `SpriteFrame`; without one it is drawn as a filled colour. Actors move every frame so they are a `renderFrame` argument, not part of the cached `Scene`. Cells and placements outside the view are culled. Zoom multiplies draw sizes; smoothing stays off so pixels stay square.

Editor: `MapCanvas` is one element with one `<canvas>` and one `engine/loop.ts` loop. It builds the scene with `Client/Service/build-scene.ts` from `mapSession.visibleTileMap()` and marks it stale on `map-session-changed`. The pointer always lands on it: pencil and rubber call `withTile` per pointer sample and save on mouseup, rectangle previews a span and calls `withRect` on mouseup, fill calls `floodFill` (bounded by the map, not the view) and saves at once. On an attribute target the same tools write 0/1 collision or the chosen elevation (rubber writes 0). `Client/Service/draw-attributes.ts` draws painted collision in red, cells a solid metatile blocks in orange, and non-zero elevation as a tinted, numbered cell; each overlay hides without changing data. The brush is a metatile id; a one-cell ghost canvas previews it. The middle button pans the shared `camera` (`Client/Service/camera.ts`, which holds the `View`); the wheel and the HUD's −/+ buttons zoom toward the cursor or the centre. The HUD (bottom-left) also toggles the grid (`Client/Service/draw-grid.ts` strokes cell borders and the map outline over the frame) and reads out the cell under the cursor. Zoom and the grid flag persist in `user-data.json` (`zoom`, `showGrid`). `Client/Service/pointer-to-world.ts` is the one pointer → world formula and takes the `View`.

Play: `play.ts` builds a scene once and runs the same loop and `renderFrame` at zoom 2. The player is a `domain/movement.ts` `Player`: a cell, a facing, and an optional `Step` (`from`, `to`, `durationMs`, `elapsedMs`). Each frame the host passes `{ direction, running }` — `Client/Service/held-directions.ts` keeps held keys in press order so the newest press wins — and `stepPlayer` advances the step by the frame's milliseconds, then begins the next one if a direction is still held and `CanEnter` allows the target cell. In play the open map's `CanEnter` is `stepRule(map, tileset)` inside the grid and `crossEdge` beyond it — a step off a connected edge is allowed when the landing cell is not solid, and when that step finishes the host opens the neighbour (`openMap` in `play.ts` rebuilds the scene and rule; legacy placements for every map are decoded at boot) and places the player on the landing cell with the same facing. `stepRule`: `canStep(map, tileset, from, to)` refuses the map edge and solid cells (`isSolid`), treats a ledge as one-way — its direction is the way you hop it, so you enter a ledge cell only moving that way and cannot leave it against that way (`ledgeAt`: painted attribute, else the front metatile's) — and blocks a change between two non-zero elevations except across a ledge taken the right way. Facing changes at once even when the step cannot start; a press during a step only turns the player. Walk is `WALK_MS_PER_CELL` (267), run `RUN_MS_PER_CELL` (133), matching the GBA's 16 and 8 frames per cell. `playerPixel` interpolates `from → to` for drawing. `engine/camera.ts` (T-029) is the play camera: `GBA_VIEW` is 240×160 world pixels, `integerScale(window)` picks the scale, and `cameraFor(focus, view, mapPixels)` returns the whole-pixel top-left that centres the player's cell, clamped to `[0, map − view]` per axis, or `(map − view) / 2` (negative) when the map is smaller than the view on that axis. The editor keeps its free `Client/Service/camera.ts`.

Sprites (T-027): a `SpriteDefinition` (`domain/sprite.ts`) is a sheet id, a frame size, and per direction an `idle` rectangle and a `walk` list of rectangles on that sheet. `pickFrame(definition, direction, phase, idle)` is the whole animation rule: idle (or an empty cycle) shows the idle pose; otherwise the step's phase indexes the walk list evenly. `engine/player-actor.ts` `playerActor(player, sprite, image)` turns the `Player` into the `Actor` `renderFrame` draws — the frame for `facing` and `stepProgress`, standing on its cell so a 16×32 frame overhangs the cell above — or a red cell when the project has no player sprite. The project holds `sprites[]` and `playerSpriteId`; `SpriteEditor` (`Client/Component/Sprite/`, the side menu's walking-figure button) creates sprites from an imported sheet, lets the author pick a slot (a direction's idle or a walk frame) and click a frame on the sheet grid to assign it, previews the walk cycle, saves every change, and marks one sprite as the player's.

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
| DELETE | `/project/maps/:mapId` | removes the map; the last one may go |
| PUT | `/project/start-map` | `{ mapId }` (or null) → `{ startMapId }` |
| PUT | `/project/maps/:mapId/connections` | `{ north?, south?, east?, west? }` of `{ mapId, offset }` (every map must exist) → the updated map |
| PUT | `/project/maps/:mapId/size` | `{ width, height }` in cells (1–256) → the resized map; overlapping cells keep their ids |
| POST | `/project/tilesets` | `{ name, metatiles }` → the new tileset (ids and rectangles only, no pixels) |
| PATCH | `/project/tilesets/:tilesetId/metatiles/:metatileId` | `{ solid?, elevation?, ledge? }` → the updated tileset |
| PUT | `/project/maps/:mapId/tileset` | `{ tilesetId }` → the updated map |
| PUT | `/project/maps/:mapId/tile-map` | a whole `TileMap` (checked by `isTileMap`) → the updated map; sent after every stroke and layer edit |
| GET/PATCH | `/user-data` | camera, tool, windows |
| GET | `/placement-images` | data URLs for legacy placements; read-only |
| POST | `/upload-files` | `multer`, filename = uuid + allow-listed extension |
| POST | `/project/sprites` | a `SpriteDefinition` without an id (checked by `isSpriteDefinitionInput`) → the stored sprite |
| PUT | `/project/sprites/:spriteId` | a whole definition → the stored sprite |
| DELETE | `/project/sprites/:spriteId` | removes the sprite; clears `playerSpriteId` if it was the player's |
| PUT | `/project/player-sprite` | `{ spriteId }` (or null) → `{ playerSpriteId }` |

JSON reads and writes are synchronous. `writeJson` writes a `.tmp` sibling and renames it over the target, so a reader never sees a torn document. It does not lock: two overlapping PATCHes still race on read-modify-write (last write wins), which one server process and one editor tab keep rare.

## Sketches that are not features

These files are intentions, not behavior. Do not wire them up half-way inside a bugfix. They get real designs in later tickets.

| File | State |
| --- | --- |
| `Model/Dialog.ts`, `Component/Dialog/DialogCreator.ts` | A textarea and an "add reply" button. Not saved. The window opens on every editor load. |
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
