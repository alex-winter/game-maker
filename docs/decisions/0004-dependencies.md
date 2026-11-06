# What may be a package

## Status

Accepted.

## Decision

The game, the editor's behavior, and the domain are hand-written TypeScript. They do not depend on a UI framework, a game framework, or a state container.

Allowed at the edge, until a ticket removes them:

| Package | Role |
| --- | --- |
| `typescript`, webpack, loaders | compile the browser bundles |
| `express` | local HTTP |
| `multer` | multipart upload, behind a handler that does not trust filenames |
| `@types/*` | types only |

`event-driven-web-components` and `uuid` are current dependencies and are scheduled for removal in T-018. Do not build new abstractions on top of them. New elements use the in-house base as soon as that ticket's base exists; the ticket itself migrates the old elements.

## Why

The project exists to be a readable program: small functions, small classes, no framework lifecycle to fight. Packages at the edge are replaceable. A framework in the middle is not.

## Consequences

- A proposal to add React, Phaser, Pixi, Redux, or an ECS library is a rejection of this decision, not a shortcut. Re-open the decision in a ticket before adding the package.
- Utility code we would write in twenty lines stays in the repo (`snap`, rectangle intersection, id generation).
- The local server is not the game. A test of a warp does not boot Express.
