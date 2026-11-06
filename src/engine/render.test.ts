import test from 'node:test'
import assert from 'node:assert/strict'
import { emptyTileMap, withTile } from '../domain/map'
import { Tileset } from '../domain/tileset'
import { DrawPort } from './draw-port'
import { renderFrame } from './render'
import { Scene } from './scene'

type Call = { image: string; sx: number; sy: number; dx: number; dy: number }

function recordingPort(width = 64, height = 64): DrawPort<string> & { calls: Call[]; clears: number } {
    const port = {
        width,
        height,
        calls: [] as Call[],
        clears: 0,
        clear(): void {
            port.clears++
        },
        drawImage(image: string, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number): void {
            port.calls.push({ image, sx, sy, dx, dy })
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

    renderFrame(port, scene(), { x: 0, y: 0 })

    assert.equal(port.clears, 1)
    assert.equal(port.calls.length, 0)
})

test('the back placement layer is drawn before the front one', () => {
    const port = recordingPort()
    const back = { placements: [{ image: 'back', x: 0, y: 0, width: 16, height: 16 }] }
    const front = { placements: [{ image: 'front', x: 0, y: 0, width: 16, height: 16 }] }

    renderFrame(port, scene({ placementLayers: [back, front] }), { x: 0, y: 0 })

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

    renderFrame(port, scene({ placementLayers: [layer] }), { x: 64, y: 0 })

    assert.deepEqual(port.calls, [{ image: 'seen', sx: 0, sy: 0, dx: 16, dy: 16 }])
})

test('tile layers draw back to front and cut the metatile from its sheet', () => {
    const port = recordingPort()
    const map = emptyTileMap({ width: 4, height: 4 })

    map.layers[0] = withTile(map, map.layers[0], { x: 1, y: 1 }, 1)
    map.layers[1] = withTile(map, map.layers[1], { x: 1, y: 1 }, 2)

    renderFrame(port, scene({ tileMap: map }), { x: 0, y: 0 })

    assert.deepEqual(port.calls, [
        { image: 'sheet-image', sx: 0, sy: 0, dx: 16, dy: 16 },
        { image: 'sheet-image', sx: 16, sy: 0, dx: 16, dy: 16 },
    ])
})

test('tile layers draw before placement layers', () => {
    const port = recordingPort()
    const map = emptyTileMap({ width: 4, height: 4 })

    map.layers[0] = withTile(map, map.layers[0], { x: 0, y: 0 }, 1)

    const placements = [{ placements: [{ image: 'placed', x: 0, y: 0, width: 16, height: 16 }] }]

    renderFrame(port, scene({ tileMap: map, placementLayers: placements }), { x: 0, y: 0 })

    assert.deepEqual(port.calls.map(call => call.image), ['sheet-image', 'placed'])
})

test('cells outside the view are culled and a missing sheet is skipped', () => {
    const port = recordingPort(32, 32)
    const map = emptyTileMap({ width: 4, height: 4 })

    map.layers[0] = withTile(map, map.layers[0], { x: 3, y: 3 }, 1)
    map.layers[0] = withTile(map, map.layers[0], { x: 0, y: 0 }, 3)
    map.layers[0] = withTile(map, map.layers[0], { x: 1, y: 0 }, 1)

    renderFrame(port, scene({ tileMap: map }), { x: 0, y: 0 })

    assert.deepEqual(port.calls, [{ image: 'sheet-image', sx: 0, sy: 0, dx: 16, dy: 0 }])
})

test('without a tileset only placements draw', () => {
    const port = recordingPort()
    const map = emptyTileMap({ width: 4, height: 4 })

    map.layers[0] = withTile(map, map.layers[0], { x: 0, y: 0 }, 1)

    renderFrame(port, scene({ tileMap: map, tileset: undefined }), { x: 0, y: 0 })

    assert.equal(port.calls.length, 0)
})
