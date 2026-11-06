# Code standards

These apply to every change, including bugfixes. Match them in the code you touch. Do not reformat unrelated files in the same commit.

## Language

- TypeScript in `strict` mode. No `any`. No `Function`. No `object` as a type. Prefer a named type or a generic.
- Do not silence the compiler with `as` unless the value was just checked. Do not use non-null assertion (`!`) on a lookup that can miss. Return `undefined` and handle it.
- `const` by default. Parameters and fields that do not change are readonly in the type.
- Module functions are the default. A class is for a value that owns private state and a small set of operations (a repository, a component, a map session). A class with one method that does not use instance state is a function.
- A function does one thing a reader can name. If the name needs "and", split it. Callers compose the pieces.
- Pure functions take data and return data. They do not read the DOM, `fetch`, or the clock. Pass those in from the edge.
- No barrel files that re-export the world. Import from the module that defines the name.
- Names are camelCase for fields and functions, PascalCase for types. Do not add new `snake_case` fields. When T-012 migrates a field, update the disk and the type together.
- Comments explain a constraint the code cannot show. Do not comment what the next line does. Do not leave checklist emoji in the source.

## Shape

- Domain rules live in `src/domain` once T-012 exists, and they import nothing from `Client`, `Server`, or `editor`. Until that ticket, put new pure rules in `src/Model` only if they are pure, and do not import them from a path that drags in the DOM.
- The editor displays state. It does not decide whether a step is legal. Ask a domain function.
- Side effects sit at the edge: a repository method, a request handler, a component event. The function that computes the next layer is separate from the function that PATCHes it.
- Do not add a method to `WorldEditor` for a new feature. The component that owns the gesture handles the gesture, or a domain service does.
- Prefer a new small module over a new branch inside `CanvasLayer`. That file is already doing input, painting, fill, erase, camera, and drawing.

## Data

- Identifiers are strings from `crypto.randomUUID()` at the moment of creation. Do not derive an id from a display name.
- Coordinates that are cells are integers. Pixel positions are a separate type. Do not pass a pixel to a function that means a cell.
- The grid size is one constant. Today it is 16, in more than one file. New code reads it from one module.
- Pixel art canvases set `imageSmoothingEnabled` to `false` before drawing.

## UI

- Custom elements stay thin. `build` returns a tree. Event handlers call a function and then render. They do not contain the rule.
- Do not invent a global event string when a direct call or a return value will do. The bus is for things that genuinely have many listeners (tool changed, map changed).
- Persistent UI state is explicit. If a window is not restored on load, do not write its rectangle on every resize.

## Server

- A handler validates, then returns. Every error path returns. It does not fall through into the success path.
- File paths are built from a generated id plus a fixed extension. Never from the raw client filename.
- A write replaces a file by writing a temporary sibling and renaming it, once T-016 has landed. Until then, do not add a second writer to the same JSON.

## Dependencies

- No new runtime dependency for the editor or the game without an edit to [decisions/0004-dependencies.md](decisions/0004-dependencies.md) in the same change.
- `express`, `multer`, and webpack stay at the edge. Game rules must not import them.

## Tests

- Domain functions ship with tests that call them directly. A collision change without a collision test is unfinished.
- UI behavior that is hard to unit test gets a short manual script in the ticket's test plan, and the implementer runs it.
- When T-011 lands, `npm run typecheck` passes before a ticket is marked `done`.

## Commits

- Conventional commits: `fix:`, `feat:`, `refactor:`, `test:`, `docs:`.
- One ticket's code is one commit series. Do not mix T-002 and T-014.
- Mention the ticket id in the commit body (`T-002`).
