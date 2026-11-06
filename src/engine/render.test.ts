import test from 'node:test'
import assert from 'node:assert/strict'
import { emptyTileMap, withTile } from '../domain/map'
import { Tileset } from '../domain/tileset'
import { DrawPort } from './draw-port'
import { renderFrame } from './render'
import { Scene } from './scene'

type Call = { image: string; sx: number; sy: number; dx: number; dy: number; dw: number }

function recordingPort(width = 64, height = 64): DrawPort<string> & { calls: Call[]; clears: number } {
    const port = {
        width,
        height,
        calls: [] as Call[],
        clears: 0,
        clear(): void {
            port.clears++
        },
        fillRect(x: number, y: number, w: number, h: number, color: string): void {
            port.calls.push({ image: 'rect:' + color, sx: 0, sy: 0, dx: x, dy: y, dw: w })
        },
        drawImage(image: string, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number): void {
            port.calls.push({ image, sx, sy, dx, dy, dw })
        },
    }

    return port
}

const tileset: Tileset = {
    id: 'ts',
    name: 'Test',
    metatiles: [
        { id: 1, sheetId: 'sheet', x: 0, y: 0, w: 16, h: 16, solid: false, elevation: 0, ledge: null },
        { id: 2, sheetId: 'sheet', x: 16, y: 0, w: 16, h: 16, solid: false, elevation: 0, ledge: null },
        { id: 3, sheetId: 'missing', x: 0, y: 0, w: 16, h: 16, solid: false, elevation: 0, ledge: null },
    ],
}

function scene(overrides: Partial<Scene<string>> = {}): Scene<string> {
    return {
        tileMap: emptyTileMap({ width: 4, height: 4 }),
        tileset,
        sheetById: new Map([['sheet', 'sheet-image']]),
        placementLayers: [],
        ...overrides,
    }
}

test('each frame clears before drawing', () => {
    const port = recordingPort()

    renderFrame(port, scene(), { x: 0, y: 0, zoom: 1 })

    assert.equal(port.clears, 1)
    assert.equal(port.calls.length, 0)
})

test('the back placement layer is drawn before the front one', () => {
    const port = recordingPort()
    const back = { placements: [{ image: 'back', x: 0, y: 0, width: 16, height: 16 }] }
    const front = { placements: [{ image: 'front', x: 0, y: 0, width: 16, height: 16 }] }

    renderFrame(port, scene({ placementLayers: [back, front] }), { x: 0, y: 0, zoom: 1 })

    assert.deepEqual(port.calls.map(call => call.image), ['back', 'front'])
})

test('placements outside the view are skipped and the camera offsets the rest', () => {
    const port = recordingPort(64, 64)
    const layer = {
        placements: [
            { image: 'seen', x: 80, y: 16, width: 16, height: 16 },
            { image: 'off', x: 200, y: 200, width: 16, height: 16 },
        ],
    }

    renderFrame(port, scene({ placementLayers: [layer] }), { x: 64, y: 0, zoom: 1 })

    assert.deepEqual(port.calls, [{ image: 'seen', sx: 0, sy: 0, dx: 16, dy: 16, dw: 16 }])
})

test('tile layers draw back to front and cut the metatile from its sheet', () => {
    const port = recordingPort()
    const map = emptyTileMap({ width: 4, height: 4 })

    map.layers[0] = withTile(map, map.layers[0], { x: 1, y: 1 }, 1)
    map.layers[1] = withTile(map, map.layers[1], { x: 1, y: 1 }, 2)

    renderFrame(port, scene({ tileMap: map }), { x: 0, y: 0, zoom: 1 })

    assert.deepEqual(port.calls, [
        { image: 'sheet-image', sx: 0, sy: 0, dx: 16, dy: 16, dw: 16 },
        { image: 'sheet-image', sx: 16, sy: 0, dx: 16, dy: 16, dw: 16 },
    ])
})

test('legacy placement layers are a frozen background: they draw before tile layers', () => {
    const port = recordingPort()
    const map = emptyTileMap({ width: 4, height: 4 })

    map.layers[0] = withTile(map, map.layers[0], { x: 0, y: 0 }, 1)

    const placements = [{ placements: [{ image: 'placed', x: 0, y: 0, width: 16, height: 16 }] }]

    renderFrame(port, scene({ tileMap: map, placementLayers: placements }), { x: 0, y: 0, zoom: 1 })

    assert.deepEqual(port.calls.map(call => call.image), ['placed', 'sheet-image'])
})

test('cells outside the view are culled and a missing sheet is skipped', () => {
    const port = recordingPort(32, 32)
    const map = emptyTileMap({ width: 4, height: 4 })

    map.layers[0] = withTile(map, map.layers[0], { x: 3, y: 3 }, 1)
    map.layers[0] = withTile(map, map.layers[0], { x: 0, y: 0 }, 3)
    map.layers[0] = withTile(map, map.layers[0], { x: 1, y: 0 }, 1)

    renderFrame(port, scene({ tileMap: map }), { x: 0, y: 0, zoom: 1 })

    assert.deepEqual(port.calls, [{ image: 'sheet-image', sx: 0, sy: 0, dx: 16, dy: 0, dw: 16 }])
})

test('without a tileset only placements draw', () => {
    const port = recordingPort()
    const map = emptyTileMap({ width: 4, height: 4 })

    map.layers[0] = withTile(map, map.layers[0], { x: 0, y: 0 }, 1)

    renderFrame(port, scene({ tileMap: map, tileset: undefined }), { x: 0, y: 0, zoom: 1 })

    assert.equal(port.calls.length, 0)
})

test('zoom multiplies the draw size and the screen offset, and shrinks the visible world', () => {
    const port = recordingPort(64, 64)
    const map = emptyTileMap({ width: 4, height: 4 })

    map.layers[0] = withTile(map, map.layers[0], { x: 1, y: 1 }, 1)
    map.layers[0] = withTile(map, map.layers[0], { x: 3, y: 3 }, 2)

    renderFrame(port, scene({ tileMap: map }), { x: 0, y: 0, zoom: 2 })

    // 64 screen px at zoom 2 is 32 world px: cells 0..1 only, so (3,3) is culled.
    assert.deepEqual(port.calls, [
        { image: 'sheet-image', sx: 0, sy: 0, dx: 32, dy: 32, dw: 32 },
    ])
})

test('passes: ground tiles, then actors, then overhead tiles, in that order', () => {
    const port = recordingPort()
    const map = emptyTileMap({ width: 4, height: 4 })

    // Layer list order is overhead-first here on purpose: the pass decides, not the index.
    map.layers = [
        withTile(map, { ...map.layers[1], id: 'over' }, { x: 0, y: 0 }, 2),
        withTile(map, { ...map.layers[0], id: 'ground' }, { x: 0, y: 0 }, 1),
    ]

    const actor = { x: 0, y: 0, width: 16, height: 16, color: 'red' }

    renderFrame(port, scene({ tileMap: map }), { x: 0, y: 0, zoom: 1 }, [actor])

    assert.deepEqual(port.calls.map(call => [call.image, call.sx]), [
        ['sheet-image', 0],
        ['rect:red', 0],
        ['sheet-image', 16],
    ])
})

test('an actor with a sprite draws its frame; one outside the view is skipped', () => {
    const port = recordingPort(32, 32)
    const seen = { x: 8, y: 8, width: 16, height: 16, color: 'red', sprite: { image: 'hero', sx: 32, sy: 0, sw: 16, sh: 16 } }
    const unseen = { x: 100, y: 100, width: 16, height: 16, color: 'red' }

    renderFrame(port, scene(), { x: 0, y: 0, zoom: 2 }, [seen, unseen])

    assert.deepEqual(port.calls, [{ image: 'hero', sx: 32, sy: 0, dx: 16, dy: 16, dw: 32 }])
})
