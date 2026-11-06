# Maps are metatile grids

## Status

Accepted.

## Decision

A map is a rectangle of 16×16 metatiles. Each layer stores metatile ids, not images and not pixel coordinates. Collision, elevation, and ledge direction are attributes on the cell, not pictures.

Pixel placement remains only until T-020 removes painting with it. Importers may still cut a rectangle out of a user sheet to define a metatile.

## Why

Pokémon generation 3 field games are grids. Doors, grass, ledges, and "the tile in front of the player" are cell queries. The current placement list cannot answer those queries without scanning images, and the fill tool already collapses many cells into one bitmap.

Free placement is a reasonable editor trick for a poster. It is the wrong source of truth for this game.

## Consequences

- The grid size is a single constant, 16.
- Tools snap to cells, not to arbitrary pixels.
- A metatile id is stable when the pixels move inside a tileset. Maps store ids.
- Overhead and ground are layers of the same kind of data, drawn in a fixed order around the player sprite.
