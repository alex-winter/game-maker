---
id: T-021
title: Show a grid, zoom, and the cell coordinate
status: ready
priority: P1
phase: 2
type: feat
area: editor
depends_on: [T-017]
blocks: []
---

# T-021 Show a grid, zoom, and the cell coordinate

## Outcome

The author can toggle a 16×16 grid, zoom the view with nearest-neighbor scaling, and read the cell under the cursor.

## Why

A town cannot be aligned by eye at 1× with no coordinates.

## Scope

In:

- Grid overlay rendered by the engine or by a view that uses the camera.
- Zoom levels that are integers (1, 2, 3, 4).
- A readout of the cell coordinate.

Out:

- Minimap.
- Rotate.

## Touch

- Engine camera: include zoom.
- Editor overlay.

## Approach

- Zoom multiplies the draw size and divides pointer movement into world pixels. Update the pointer-to-world helper from T-002 rather than adding a second formula.
- Smoothing stays off so zoomed pixels stay square.

## Acceptance

- [ ] At zoom 2, a metatile is 32 screen pixels and still crisp.
- [ ] The readout matches the cell that a click paints.
- [ ] The grid lines land on cell borders at every zoom.

## Test plan

- Manual at zoom 1 and zoom 4. Click the corner of a cell and confirm the readout and the stamp.
