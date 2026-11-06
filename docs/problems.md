# Current problems

Each item is something the code does today. The fix is the linked ticket. If a ticket is `done`, leave the item here and mark it fixed so later agents do not "fix" it again.

## Server

1. **Fixed (T-001).** **Error responses fall through.** `delete-layers.ts` sends 404 when the uuid is missing and then still runs. `splice(-1, 1)` deletes the last layer. A second `response.json` runs after the 404. `post-layers.ts` sends 400 for a non-array body and then spreads that body anyway. Ticket T-001.

2. **Fixed (T-009).** **Uploads trust the original filename.** `multer` writes `file.originalname` into `uploads/`. Two files with the same name overwrite each other. A name with `../` is a path escape. Ticket T-009.

3. **Round-trip and MIME fixed (T-007); storage still inline until T-015.** **Sheet GET is a synchronous base64 dump.** `get-sheets.ts` reads every upload inside the `readdir` callback with `readFileSync`, and builds `data:image/<ext>` so JPEG is `image/jpg`. The client keeps that whole payload in memory. Ticket T-007 for the round-trip; T-015 replaces the storage.

4. **Fan-out fixed (T-005); atomic writes still open (T-016).** **JSON writes can tear.** `writeJson` truncates the destination in place. A crash or an overlapping request leaves `layers.json` half-written. `LayerRepository.update` fires a PATCH per call and does not order them. `setActive` and `toggleVisible` PATCH every layer, not the one that changed. Ticket T-005 for the fan-out; T-016 for atomic writes.

## Editor geometry and tools

5. **Fixed (T-002).** **The brush is in the wrong coordinate space.** `CanvasLayer.handleMouseMove` treats `clientX`/`clientY` as canvas pixels. The canvas is inset by the side menu, so stamped tiles land away from the cursor. The ghost image is `position: fixed`, so it follows the cursor and disagrees with the stamp. Ticket T-002.

6. **Fixed (T-008).** **The first click can stamp a stale cell.** `mousedown` calls `generatePlacement` using `mouseCoordinates` from the previous move, or `{0,0}` if the pointer has not moved on that layer. The rubber's document-level `mousemove` has the same stale read. Ticket T-008.

7. **Fixed (T-008).** **Fill and rubber do not agree on what a tile is.** Fill deletes every cell in the region and inserts one bitmap whose origin is the top-left of the bounds. Rubber deletes only a placement whose origin equals the snapped cursor, so a filled region is not erasable except at that corner. Fill's bounds use the canvas rectangle; the cursor math uses the viewport. Ticket T-008 keeps the current tools honest. Ticket T-014 replaces both with metatiles.

8. **Fixed (T-004).** **Cameras drift apart.** Each `CanvasLayer` copies `viewCoordinates`. Pan applies a delta to the others, which works only while they started equal. Layers created from `new-layer-mapped` are constructed without `userData`, so they start at `{0,0}`. Ticket T-004.

9. **Fixed (T-003).** **Placements are decoded twice.** `WorldEditor.setup` pushes a loaded placement, then `loadPlacement` in `CanvasLayer.setup` pushes another with the same uuid. The history lists both. The canvas draws both. Ticket T-003.

10. **Fixed (T-005).** **Layer visibility and selection restart every canvas.** `layers-update` calls `patch()`, which rebuilds the layer DOM and starts another animation loop. `setActive` emits that once per layer. Ticket T-005.

11. **Frame delay is a bitwise accident.** `Canvas2D` does `1000 / fps | 30`. `|` is bitwise OR, and it binds looser than `/`, so 60 fps becomes `16 | 30 === 30` milliseconds. Ticket T-010.

12. **Fixed (T-007).** **Sheet open races the upload.** The listing shows a local data URL immediately. `open-sheet` looks up `sheetRepository`, which was filled from `GET /sheets` at startup and is never refreshed. A new file throws on `sheet.name` because `getByName` returns undefined. Reopening an upload also depends on the server having finished `multer`. Ticket T-007.

13. **The dialog window is not a feature.** `WorldEditor.build` always appends `DialogCreator`. It does not save. Closing it forgets nothing worth keeping, and the next load opens it again. `userData.windows` is written and never read. Ticket T-036 owns real dialog; until then T-011's cleanup note and the empty handler in `handleOpenNewModel` should not be "finished" by wiring the stub. Leave the stub dark. A small fix lives in T-010's out-of-scope note: do it inside T-036, not as drive-by UI.

14. **Fixed (T-008).** **Selector snap and map snap differ.** The sheet viewer rounds to 16 (`Math.round`). The map floors to 16 (`Math.floor` via `snap`). A selection on a sheet and a stamp on the map do not share a function. Ticket T-008.

15. **`SpriteModelMaker` is dead code that does not compile into the page.** It is not in `COMPONENTS`, so `Dom.makeComponent` would throw. The camera button emits `click-open-new-model` and the handler is empty. Leave it until T-027.

## Play mode

16. **Fixed (T-006).** **Play is a camera debug view.** `keys` is never read. `keydown` subtracts `viewMoveSpeed` once per event. Key repeat is the only thing that makes holding an arrow move. There is no `keyup`, no `preventDefault`, and no resize. Ticket T-006.

17. **Fixed (T-006).** **Play draws layers in the opposite order to the editor.** The editor's z-index is `500 - order` (smaller `order` in front). Play sorts `(a, b) => b.order - a.order` and draws later entries on top (larger `order` in front). Ticket T-006.

## Structural

18. **There is no project and no map.** One global `layers.json` is the whole game. `Project` and `projectsDir` are unused. Ticket T-013.

19. **A placement is not a tile.** Coordinates are pixels, pictures are data URLs, and fill destroys tile identity. Collision cannot be queried without decoding images. A walking actor cannot ask "what is in the cell in front of me" cheaply. Ticket T-014.

20. **Two programs draw the world.** Editor loops live in `Canvas2D` per layer. Play loops in `play.ts`. They will diverge further every time a rule is added. Ticket T-017.

21. **Domain types are mixed into UI modules, and UI types leak the other way.** `Dataset` is `{ [key: string]: any }`. Field names mix `created_at` with `lastViewPosition`. `componentConfigration` is misspelled and stored that way on disk. Ticket T-012 sets the boundary; do not rename persisted fields until that ticket's migration runs.

22. **The component base is a runtime dependency of every view.** `event-driven-web-components` owns the lifecycle. `uuid` exists to make stable ids for those tags. Neither is a game concept. Ticket T-018.

23. **Nothing checks the types.** `typescript`, `typescript-eslint`, and a deprecated `tslint` are installed. `package.json` has no `typecheck` or `lint` script, and no tests. Ticket T-011.

## Not bugs, and not to be "fixed" early

- The menu bar does nothing. It stays inert until a ticket needs it.
- Placement history will not scale to a town. Do not virtualize it. Metatile editing (T-020) replaces it.
- `AnimationMaker` is an empty shell. Player animation is T-027, built from domain data, not by filling this shell in place.
