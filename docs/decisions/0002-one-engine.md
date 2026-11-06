# One engine, two hosts

## Status

Accepted.

## Decision

Walking, collision, warps, animation frame selection, and drawing a map are engine functions. The editor and the play page both call them. The editor adds tools and persistence. The play page adds the player and the save slot. Neither reimplements the map.

## Why

`play.ts` and `CanvasLayer` already disagree about layer order, input, and what a camera is. Every new rule would have to be written twice and would drift.

## Consequences

- Engine modules do not import a custom element.
- The editor's canvas is a view over engine state, including while the player is not running. Painting updates the map; the engine renders the map.
- Play mode does not fetch raw JSON and draw it with a private loop. It loads a project and starts a session.
