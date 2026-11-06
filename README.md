# Game maker

A dependency-light TypeScript tool for building and playing 2D games in the style of a Pokémon generation 3 overworld: tile maps, walking, entering houses, finding items, and talking to people. The editor and the playable game share one engine.

This repository is early. The editor can import sprite sheets, paint snapped images onto layers, and open a play page that pans a camera over those images. It cannot yet represent a real map, a walking player, a door, or an item.

## Run it

```bash
npm install
npm run build     # webpack: public/dist (editor and play pages) and dist/server.js
npm start         # node dist/server.js, on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) for the editor and [http://localhost:3000/play](http://localhost:3000/play) for the play page. Layers, placement images, and user data are written under `data/`; uploaded sheets under `uploads/`.

Before marking work done:

```bash
npm run typecheck # tsc --noEmit over src/
npm test          # node --test over src/**/*.test.ts, compiled to dist/test
```

`npm run watch:client` and `npm run watch:server` rebuild on change; restart `npm start` after a server rebuild.

## Read this before changing code

Agents and people continuing the project start in [`docs/README.md`](docs/README.md). That folder is the source of truth for how the program works today, what is broken, how the code should be written, and which ticket to do next.

Do not add a second roadmap, board, or TODO list elsewhere.
