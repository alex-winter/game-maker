import test from 'node:test'
import assert from 'node:assert/strict'
import { canStep, directionBetween, ledgeAt, stepRule } from './collision'
import { cellIndex, emptyTileMap, TileMap } from './map'
import { newPlayer, stepPlayer } from './movement'
import { LedgeDirection, Metatile, Tileset } from './tileset'

const tile = (id: number, overrides: Partial<Metatile> = {}): Metatile =>
    ({ id, sheetId: 's', x: 0, y: 0, w: 16, h: 16, solid: false, elevation: 0, ledge: null, ...overrides })

const LEDGE_DOWN = 2

const tileset: Tileset = {
    id: 'ts',
    name: 'Test',
    metatiles: [tile(1), tile(LEDGE_DOWN, { ledge: 'down' })],
}

const size = { width: 5, height: 5 }

/** A flat 5×5 map, optionally with painted collision, elevation, and ledges. */
function mapWith(edit: (map: TileMap) => void = () => undefined): TileMap {
    const map = emptyTileMap(size)

    edit(map)

    return map
}

const at = (map: TileMap, x: number, y: number): number => {
    const index = cellIndex(map, { x, y })

    if (index === undefined) {
        throw new Error('outside')
    }

    return index
}

test('directionBetween names a one-cell step and refuses anything else', () => {
    assert.equal(directionBetween({ x: 1, y: 1 }, { x: 2, y: 1 }), 'right')
    assert.equal(directionBetween({ x: 1, y: 1 }, { x: 1, y: 0 }), 'up')
    assert.equal(directionBetween({ x: 1, y: 1 }, { x: 3, y: 1 }), undefined)
    assert.equal(directionBetween({ x: 1, y: 1 }, { x: 1, y: 1 }), undefined)
})

test('the map edge blocks, and so does a flat painted wall; open ground does not', () => {
    const map = mapWith(m => { m.attributes.collision[at(m, 2, 2)] = 1 })

    assert.equal(canStep(map, tileset, { x: 0, y: 0 }, { x: -1, y: 0 }), false)
    assert.equal(canStep(map, tileset, { x: 1, y: 2 }, { x: 2, y: 2 }), false)
    assert.equal(canStep(map, tileset, { x: 2, y: 1 }, { x: 2, y: 2 }), false)
    assert.equal(canStep(map, tileset, { x: 1, y: 1 }, { x: 1, y: 2 }), true)
})

test('elevation blocks when two non-zero levels differ; 0 means any', () => {
    const map = mapWith(m => {
        m.attributes.elevation[at(m, 1, 1)] = 3
        m.attributes.elevation[at(m, 2, 1)] = 5
        m.attributes.elevation[at(m, 1, 2)] = 3
    })

    assert.equal(canStep(map, tileset, { x: 1, y: 1 }, { x: 2, y: 1 }), false, '3 → 5 blocks')
    assert.equal(canStep(map, tileset, { x: 1, y: 1 }, { x: 1, y: 2 }), true, '3 → 3 passes')
    assert.equal(canStep(map, tileset, { x: 1, y: 1 }, { x: 0, y: 1 }), true, '3 → 0 passes')
})

for (const ledge of ['up', 'down', 'left', 'right'] as const) {
    test(`a ${ledge} ledge is entered only while moving ${ledge}, and cannot be climbed back`, () => {
        const map = mapWith(m => { m.attributes.ledge[at(m, 2, 2)] = ledge })
        const approaches: { [D in LedgeDirection]: [from: { x: number; y: number }, to: { x: number; y: number }] } = {
            down: [{ x: 2, y: 1 }, { x: 2, y: 2 }],
            up: [{ x: 2, y: 3 }, { x: 2, y: 2 }],
            right: [{ x: 1, y: 2 }, { x: 2, y: 2 }],
            left: [{ x: 3, y: 2 }, { x: 2, y: 2 }],
        }

        for (const direction of ['up', 'down', 'left', 'right'] as const) {
            const [from, to] = approaches[direction]

            assert.equal(canStep(map, tileset, from, to), direction === ledge, `approach moving ${direction}`)
        }

        // Standing on the ledge, the step against its direction is refused and the step along it is allowed.
        const [before, ledgeCell] = approaches[ledge]

        assert.equal(canStep(map, tileset, ledgeCell, before), false, 'back up the ledge')

        const beyond = { x: ledgeCell.x + (ledgeCell.x - before.x), y: ledgeCell.y + (ledgeCell.y - before.y) }

        assert.equal(canStep(map, tileset, ledgeCell, beyond), true, 'on past the ledge')
    })
}

test('a ledge taken the right way crosses an elevation change; the wrong way is still blocked', () => {
    const map = mapWith(m => {
        m.attributes.elevation[at(m, 2, 1)] = 5
        m.attributes.ledge[at(m, 2, 2)] = 'down'
        m.attributes.elevation[at(m, 2, 2)] = 5
        m.attributes.elevation[at(m, 2, 3)] = 3
    })

    assert.equal(canStep(map, tileset, { x: 2, y: 1 }, { x: 2, y: 2 }), true, 'onto the ledge going down')
    assert.equal(canStep(map, tileset, { x: 2, y: 2 }, { x: 2, y: 3 }), true, 'off the ledge to the lower level')
    assert.equal(canStep(map, tileset, { x: 2, y: 3 }, { x: 2, y: 2 }), false, 'back up from below')
})

test('a metatile ledge counts like a painted one, and a painted ledge overrides it', () => {
    const map = mapWith(m => {
        m.tilesetId = tileset.id
        m.layers[0].tiles[at(m, 2, 2)] = LEDGE_DOWN
        m.layers[0].tiles[at(m, 3, 3)] = LEDGE_DOWN
        m.attributes.ledge[at(m, 3, 3)] = 'left'
    })

    assert.equal(ledgeAt(map, tileset, { x: 2, y: 2 }), 'down')
    assert.equal(ledgeAt(map, tileset, { x: 3, y: 3 }), 'left')
    assert.equal(ledgeAt(map, tileset, { x: 0, y: 0 }), null)
})

test('a refused step still turns the player, and sliding along a wall works', () => {
    const map = mapWith(m => { m.attributes.collision[at(m, 3, 2)] = 1 })
    const rule = stepRule(map, tileset)
    let player = newPlayer({ x: 2, y: 2 }, 'down')

    player = stepPlayer(player, { direction: 'right', running: false }, 16, rule)
    assert.equal(player.facing, 'right')
    assert.equal(player.step, null)

    player = stepPlayer(player, { direction: 'up', running: false }, 16, rule)
    assert.deepEqual(player.step?.to, { x: 2, y: 1 })
})
