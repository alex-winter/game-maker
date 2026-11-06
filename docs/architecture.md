# Architecture today

The program is a local editor plus a play page. Both are webpack bundles. An Express process serves them and stores JSON on disk. There is one implicit project, one implicit map, and no engine module.

```
src/
  Client/     browser UI and the play page
  domain/     pure types and rules: coordinates, grid, rect, ids. No DOM, no Express.
  Model/      shared types for the placement model (some are unused sketches)
  Server/     Express routes and JSON files
public/       index.html, play.html, built bundles in dist/
data/         created at runtime: layers, placement images, user data, sprite models
uploads/      sprite sheet files, stored as <uuid><ext>, plus index.json with the original names
```

`npm run build` compiles both bundles, `npm start` runs Express, `npm run typecheck` runs `tsc --noEmit`, and `npm test` runs `node --test` over `src/**/*.test.ts`. See the root README.

## Boot

Editor (`public/index.html` → `src/Client/index.ts`):

1. Register every custom element in `Client/Constants/components.ts`.
2. On `DOMContentLoaded`, append an `<ide-wrapper>`.
3. `Ide` paints a menu bar (the items do nothing) and a `WorldEditor`.
4. `WorldEditor.setup` loads user data, layers, sheets, and placement images, then decodes every placement into `loadedPlacementRepository`.
5. `WorldEditor.build` mounts the side menu, the tool bar, one `CanvasLayer` per layer, and always opens a dialog window.

Play (`public/play.html` → `src/Client/play.ts`):

1. Load every layer and every placement image.
2. Draw them in one canvas from a camera offset.
3. Held arrow keys pan that offset every frame at 120 px/s. There is no player and no collision.

The two draw paths do not share a function (T-017), but both order layers with `Model/draw-order.ts`.

## UI model

`Client/Service/Component.ts` subclasses `event-driven-web-components`. Components implement `setup`, `build`, and `css`. `Dom.makeComponent` JSON-encodes a dataset onto the element. The library parses it back as `parsedDataset`.

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
| `new-layer-mapped` | `WorldEditor` | `WorldEditor` | `Layer[]` |
| `layer-placement-made` | `CanvasLayer` | `WorldEditor` | `Layer` |
| `layer-active` | `LayerItem` | `WorldEditor` | `Layer` |
| `layer-visible-toggle` | `LayerItem` | `WorldEditor` | `Layer` |
| `layer-delete` | `LayerItem` | `WorldEditor` | uuid |
| `layer-deleted` | `WorldEditor` | `CanvasLayer`, `LayerItem` | uuid |
| `updated-view-coordinates` | `CanvasLayer` | `WorldEditor` | `Coordinates` |
| `window-update` | `WindowBox` | `WorldEditor` | `WindowConfiguration` |
| `request-placement-deletion` | `PlacementHistory` | `WorldEditor` | uuid |
| `placement-removed` | `WorldEditor` | none | uuid |
| `layer-order-up` / `layer-order-down` | `LayerItem` | `WorldEditor` | uuid |
| `layers-created` | `LayerRepository` | `LayerListing` | `Layer[]` |
| `layer-changed` | `LayerRepository` | `CanvasLayer`, `LayerItem` | `{ uuid, changed }` |
| `sheet-selection-made` | `SheetViewer` | every `CanvasLayer` | `HTMLImageElement` |
| `tool-selection` | `CanvasTools` | every `CanvasLayer` | tool name |
| `request-focus-on-placement` | `PlacementHistory` | every `CanvasLayer` | uuid |
| `placement-added` | `CanvasLayer` | `PlacementHistory` | none |
| `close-modal` | `NewLayerForm` | `BasicModal` | the form element |

`WorldEditor` subscribes to most of these and is the de facto application object. New behavior should not land there. Give it a home in the domain or in the component that owns the interaction.

## Data on disk

| File | Written by | Shape |
| --- | --- | --- |
| `data/layers.json` | layer routes | `Layer[]` |
| `data/placement-images.json` | placement-image route | `{ uuid, src }[]` where `src` is a data URL |
| `data/user-data.json` | user-data route | camera, tool name, window rects |
| `data/sprite-models.json` | sprite-model route | unused by the client |
| `uploads/<uuid><ext>` | `multer` | the sheet bytes |
| `uploads/index.json` | upload route | `{ id, originalName, file }[]` |

`config.projectsDir` points at `data/projects.json` and is never read. `Project` is an unused type.

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

## Draw path in the editor

Each layer is its own custom element, absolutely stacked, with its own `<canvas>` and its own `setTimeout` + `requestAnimationFrame` loop (`Canvas2D`). Z-order is `500 - layer.order`, so a **lower** `order` paints **in front**.

The active layer has `pointer-events`. Pencil, fill, and rubber run there. Middle mouse pans that layer and emits `moving-in-canvas` so the others apply the same delta. Each layer stores its own camera. A layer created after load does not receive `userData`, so its camera starts at `0,0` while the others resume `lastViewPosition`.

Painting uses `event.clientX` / `clientY` as if the canvas origin were the viewport origin. The side menu means it is not. See T-002.

`loadedPlacementRepository` is an in-memory list of decoded images. `WorldEditor.setup` fills it, then every `CanvasLayer.setup` calls `loadPlacement` for the same records again.

## HTTP

| Method | Path | Role |
| --- | --- | --- |
| GET | `/` | editor HTML |
| GET | `/play` | play HTML |
| GET | `/sheets` | every upload, read asynchronously, returned as base64 with a mapped MIME type |
| GET/POST/PATCH | `/layers` | the one map |
| DELETE | `/layers/:uuid` | remove a layer |
| GET/PATCH | `/user-data` | camera, tool, windows |
| GET/POST | `/placement-images` | data URLs |
| POST | `/upload-files` | `multer`, filename = uuid + allow-listed extension |
| POST | `/sprite-model` | append to a file the client never reads |

JSON reads and writes are synchronous and not atomic. Two overlapping `PATCH /layers` can lose a placement.

## Sketches that are not features

These files are intentions, not behavior. Do not wire them up half-way inside a bugfix. They get real designs in later tickets.

| File | State |
| --- | --- |
| `Model/Dialog.ts`, `Component/Dialog/DialogCreator.ts` | A textarea and an "add reply" button. Not saved. The window opens on every editor load. |
| `Model/AnimatedSprite.ts` | Walk and idle frame lists. Nothing reads them. |
| `Model/SpriteModel.ts`, `SpriteModelMaker.ts` | Maker is not a registered element. Side-menu handler is empty. |
| `Component/Animation/AnimationMaker.ts` | Empty container. Registered, never opened. |
| `Model/Skill.ts` | `{ uuid }` only. |
| `Model/Project.ts` | Unused. |

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
