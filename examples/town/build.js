#!/usr/bin/env node
/**
 * Builds the sample town (T-051) into the running editor's project through
 * the same HTTP API the editor uses — every byte it writes is something the
 * editor could have written. Run with the server up:
 *
 *     npm run build && npm start      # in one terminal
 *     node examples/town/build.js     # in another
 *
 * It generates its own placeholder art (flat colours and simple shapes;
 * nothing is copied from any game), uploads the sheets, and creates a
 * tileset, three maps, dialogs, flags, items, species, moves, a type chart,
 * a starter, and the start map. It refuses to run twice: delete the maps it
 * made (or `data/project.json`) to start over.
 *
 * How to play what it builds: docs/sample-town.md.
 */
const zlib = require('node:zlib')

const API = process.env.GAME_MAKER_URL ?? 'http://localhost:3000'

// ---------------------------------------------------------------------------
// A tiny PNG writer: RGBA, no filter, one IDAT. Enough for flat pixel art.
// ---------------------------------------------------------------------------

const CRC_TABLE = new Uint32Array(256).map((_, n) => {
    let c = n

    for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }

    return c >>> 0
})

function crc32(bytes) {
    let crc = 0xffffffff

    for (const byte of bytes) {
        crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
    }

    return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
    const length = Buffer.alloc(4)
    const typeBytes = Buffer.from(type, 'ascii')
    const crc = Buffer.alloc(4)

    length.writeUInt32BE(data.length)
    crc.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])))

    return Buffer.concat([length, typeBytes, data, crc])
}

class Canvas {
    constructor(width, height) {
        this.width = width
        this.height = height
        this.pixels = Buffer.alloc(width * height * 4)
    }

    set(x, y, [r, g, b, a = 255]) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
            return
        }

        const at = (y * this.width + x) * 4

        this.pixels[at] = r
        this.pixels[at + 1] = g
        this.pixels[at + 2] = b
        this.pixels[at + 3] = a
    }

    rect(x, y, w, h, color) {
        for (let j = 0; j < h; j++) {
            for (let i = 0; i < w; i++) {
                this.set(x + i, y + j, color)
            }
        }
    }

    /** A filled disc, for tree tops and heads. */
    disc(cx, cy, radius, color) {
        for (let y = -radius; y <= radius; y++) {
            for (let x = -radius; x <= radius; x++) {
                if (x * x + y * y <= radius * radius) {
                    this.set(cx + x, cy + y, color)
                }
            }
        }
    }

    png() {
        const header = Buffer.alloc(13)

        header.writeUInt32BE(this.width, 0)
        header.writeUInt32BE(this.height, 4)
        header[8] = 8 // bit depth
        header[9] = 6 // colour type: RGBA
        header[10] = 0
        header[11] = 0
        header[12] = 0

        const rowLength = this.width * 4
        const raw = Buffer.alloc((rowLength + 1) * this.height)

        for (let y = 0; y < this.height; y++) {
            raw[y * (rowLength + 1)] = 0
            this.pixels.copy(raw, y * (rowLength + 1) + 1, y * rowLength, (y + 1) * rowLength)
        }

        return Buffer.concat([
            Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
            chunk('IHDR', header),
            chunk('IDAT', zlib.deflateSync(raw)),
            chunk('IEND', Buffer.alloc(0)),
        ])
    }
}

// ---------------------------------------------------------------------------
// Art. Every tile is 16×16; the sheet is 8 columns wide. Ids are row-major
// from 1, as `sliceSheet` numbers them, so column c of row r is 8r + c + 1.
// ---------------------------------------------------------------------------

const T = 16

const GRASS = [120, 184, 96]
const GRASS_DARK = [96, 160, 80]
const PATH = [216, 192, 144]
const PATH_DARK = [192, 168, 120]
const WALL = [200, 200, 208]
const WALL_DARK = [160, 160, 176]
const ROOF = [184, 72, 72]
const ROOF_DARK = [144, 48, 48]
const WOOD = [152, 104, 56]
const WOOD_DARK = [112, 72, 40]
const LEAF = [56, 128, 64]
const LEAF_LIGHT = [88, 160, 88]
const WATER = [72, 136, 208]
const WATER_LIGHT = [120, 176, 232]
const FLOOR = [208, 176, 128]
const FLOOR_DARK = [184, 152, 104]
const INNER_WALL = [232, 224, 200]
const INNER_WALL_DARK = [200, 192, 168]
const SHEET = [240, 240, 248]
const BLANKET = [96, 120, 200]
const GIFT = [224, 80, 96]
const RIBBON = [248, 232, 96]
const FLOWER = [240, 120, 160]
const FLOWER_2 = [248, 232, 120]
const RUG = [168, 72, 88]
const BOOK_1 = [72, 112, 184]
const BOOK_2 = [184, 112, 72]
const CLEAR = [0, 0, 0, 0]

/** A deterministic dot pattern so grass and water have some texture without randomness. */
function speckle(c, x, y, color, every) {
    for (let j = 0; j < T; j++) {
        for (let i = 0; i < T; i++) {
            if ((i * 7 + j * 13) % every === 0) {
                c.set(x + i, y + j, color)
            }
        }
    }
}

const TILE_PAINTERS = {
    // Row 0
    1: (c, x, y) => { c.rect(x, y, T, T, GRASS); speckle(c, x, y, GRASS_DARK, 5) },
    2: (c, x, y) => { c.rect(x, y, T, T, PATH); speckle(c, x, y, PATH_DARK, 7) },
    3: (c, x, y) => {
        c.rect(x, y, T, T, WALL)
        for (let row = 0; row < 4; row++) {
            c.rect(x, y + row * 4 + 3, T, 1, WALL_DARK)
            c.rect(x + (row % 2 === 0 ? 4 : 10), y + row * 4, 1, 3, WALL_DARK)
        }
    },
    4: (c, x, y) => { c.rect(x, y, T, T, ROOF); for (let row = 0; row < T; row += 4) c.rect(x, y + row, T, 1, ROOF_DARK) },
    5: (c, x, y) => { c.rect(x, y, T, T, WALL); c.rect(x + 3, y + 2, 10, 14, WOOD_DARK); c.rect(x + 4, y + 3, 8, 13, WOOD); c.set(x + 10, y + 9, RIBBON) },
    6: (c, x, y) => {
        c.rect(x, y, T, T, GRASS)
        for (let i = 1; i < T; i += 3) {
            c.rect(x + i, y + 4 + (i % 2) * 3, 1, T - 4 - (i % 2) * 3, LEAF)
            c.rect(x + i + 1, y + 7, 1, T - 7, LEAF_LIGHT)
        }
    },
    7: (c, x, y) => { c.rect(x, y, T, T, GRASS); c.rect(x + 6, y + 10, 4, 6, WOOD_DARK); c.disc(x + 8, y + 7, 6, LEAF); c.disc(x + 6, y + 5, 3, LEAF_LIGHT) },
    8: (c, x, y) => { c.rect(x, y, T, T, WATER); speckle(c, x, y, WATER_LIGHT, 9) },
    // Row 1
    9: (c, x, y) => { c.rect(x, y, T, T, FLOOR); for (let row = 0; row < T; row += 4) c.rect(x, y + row, T, 1, FLOOR_DARK); c.rect(x + 8, y, 1, T, FLOOR_DARK) },
    10: (c, x, y) => { c.rect(x, y, T, T, INNER_WALL); c.rect(x, y + 12, T, 4, INNER_WALL_DARK) },
    11: (c, x, y) => { c.rect(x, y, T, T, FLOOR); c.rect(x + 1, y + 4, 14, 7, WOOD); c.rect(x + 1, y + 4, 14, 1, WOOD_DARK); c.rect(x + 2, y + 11, 2, 4, WOOD_DARK); c.rect(x + 12, y + 11, 2, 4, WOOD_DARK) },
    12: (c, x, y) => { c.rect(x, y, T, T, FLOOR); c.rect(x + 1, y + 1, 14, 14, WOOD_DARK); c.rect(x + 2, y + 2, 12, 12, SHEET); c.rect(x + 2, y + 7, 12, 7, BLANKET) },
    13: (c, x, y) => { c.rect(x, y, T, T, GRASS); c.rect(x + 7, y + 8, 2, 8, WOOD_DARK); c.rect(x + 2, y + 2, 12, 7, WOOD); c.rect(x + 4, y + 4, 8, 1, WOOD_DARK); c.rect(x + 4, y + 6, 6, 1, WOOD_DARK) },
    14: (c, x, y) => { c.rect(x, y, T, T, GRASS); c.disc(x + 8, y + 9, 4, WOOD_DARK); c.disc(x + 8, y + 8, 3, WOOD); c.set(x + 8, y + 8, WOOD_DARK) },
    15: (c, x, y) => { c.rect(x, y, T, T, GRASS); c.rect(x, y + 6, T, 2, WOOD); c.rect(x, y + 11, T, 2, WOOD); c.rect(x + 2, y + 3, 2, 12, WOOD_DARK); c.rect(x + 12, y + 3, 2, 12, WOOD_DARK) },
    16: (c, x, y) => { c.rect(x, y, T, T, GRASS); speckle(c, x, y, GRASS_DARK, 5); c.disc(x + 4, y + 5, 1, FLOWER); c.disc(x + 11, y + 10, 1, FLOWER_2); c.disc(x + 12, y + 3, 1, FLOWER) },
    // Row 2
    17: (c, x, y) => { c.rect(x, y, T, T, GRASS); c.rect(x + 3, y + 5, 10, 9, GIFT); c.rect(x + 7, y + 5, 2, 9, RIBBON); c.rect(x + 3, y + 8, 10, 2, RIBBON) },
    18: (c, x, y) => { c.rect(x, y, T, T, WATER); speckle(c, x + 3, y + 2, WATER_LIGHT, 9) },
    19: (c, x, y) => { c.rect(x, y, T, T, FLOOR); c.rect(x + 1, y + 1, 14, 14, RUG); c.rect(x + 3, y + 3, 10, 10, [200, 104, 120]) },
    20: (c, x, y) => {
        c.rect(x, y, T, T, INNER_WALL)
        c.rect(x + 1, y + 1, 14, 15, WOOD_DARK)
        for (let shelf = 0; shelf < 2; shelf++) {
            for (let book = 0; book < 5; book++) {
                c.rect(x + 2 + book * 2 + (book > 2 ? 1 : 0), y + 2 + shelf * 7, 2, 5, book % 2 === 0 ? BOOK_1 : BOOK_2)
            }
        }
    },
    // A tree the hatchet can cut: the same picture as 7 but not solid. The gate on its cell does the blocking.
    21: (c, x, y) => TILE_PAINTERS[7](c, x, y),
}

const TILE_COLUMNS = 8
const TILE_ROWS = 3
const SOLID_TILES = new Set([3, 4, 7, 8, 10, 11, 12, 13, 15, 20])

function tileSheet() {
    const c = new Canvas(TILE_COLUMNS * T, TILE_ROWS * T)

    for (let id = 1; id <= TILE_COLUMNS * TILE_ROWS; id++) {
        const column = (id - 1) % TILE_COLUMNS
        const row = Math.floor((id - 1) / TILE_COLUMNS)
        const paint = TILE_PAINTERS[id]

        if (paint) {
            paint(c, column * T, row * T)
        } else {
            c.rect(column * T, row * T, T, T, CLEAR)
        }
    }

    return c
}

/**
 * A 16×32 character: 3 frames (stand, step left, step right) for each of
 * down, up, left, right, in that order along one row. 192×32.
 */
function characterSheet(shirt, hair) {
    const SKIN = [248, 208, 168]
    const TROUSERS = [64, 64, 96]
    const EYE = [32, 32, 48]
    const c = new Canvas(12 * T, 32)
    const facings = ['down', 'up', 'left', 'right']

    facings.forEach((facing, f) => {
        for (let frame = 0; frame < 3; frame++) {
            const x = (f * 3 + frame) * T
            const lift = frame === 0 ? 0 : 1

            // Legs: standing both down; stepping, one leg forward.
            c.rect(x + 5, 24 - lift, 2, 7 + lift, TROUSERS)
            c.rect(x + 9, 24 - lift, 2, 7 + lift, TROUSERS)
            if (frame === 1) c.rect(x + 5, 29, 2, 2, CLEAR)
            if (frame === 2) c.rect(x + 9, 29, 2, 2, CLEAR)
            // Body
            c.rect(x + 4, 15 - lift, 8, 9, shirt)
            c.rect(x + 3, 16 - lift, 1, 5, SKIN)
            c.rect(x + 12, 16 - lift, 1, 5, SKIN)
            // Head
            c.rect(x + 4, 5 - lift, 8, 10, SKIN)
            c.rect(x + 3, 3 - lift, 10, 4, hair)
            c.rect(x + 4, 2 - lift, 8, 1, hair)

            if (facing === 'down') {
                c.set(x + 6, 9 - lift, EYE)
                c.set(x + 9, 9 - lift, EYE)
            } else if (facing === 'up') {
                c.rect(x + 4, 5 - lift, 8, 5, hair)
            } else if (facing === 'left') {
                c.set(x + 5, 9 - lift, EYE)
                c.rect(x + 9, 5 - lift, 3, 4, hair)
            } else {
                c.set(x + 10, 9 - lift, EYE)
                c.rect(x + 4, 5 - lift, 3, 4, hair)
            }
        }
    })

    return c
}

function spriteDefinition(name, sheetId) {
    const frame = (index) => ({ x: index * T, y: 0, width: T, height: 32 })
    const facing = (first) => ({ idle: frame(first), walk: [frame(first + 1), frame(first), frame(first + 2), frame(first)] })

    return {
        name,
        sheetId,
        frameWidth: T,
        frameHeight: 32,
        directions: { down: facing(0), up: facing(3), left: facing(6), right: facing(9) },
    }
}

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------

async function call(method, path, body) {
    const response = await fetch(API + path, {
        method,
        headers: body === undefined ? {} : { 'content-type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
    })

    if (!response.ok) {
        throw new Error(`${method} ${path} → ${response.status}: ${await response.text()}`)
    }

    return response.json()
}

async function upload(filename, canvas) {
    const form = new FormData()

    form.append('files[]', new Blob([canvas.png()], { type: 'image/png' }), filename)

    const response = await fetch(API + '/upload-files', { method: 'POST', body: form })

    if (!response.ok) {
        throw new Error(`upload ${filename} → ${response.status}: ${await response.text()}`)
    }

    const { files } = await response.json()

    return files[0].id
}

// ---------------------------------------------------------------------------
// Maps. A map is drawn as rows of characters, one per cell; the legend says
// which tile each character paints and which cells are solid or grass.
// ---------------------------------------------------------------------------

const LEGEND = {
    '.': 1, // grass
    '=': 2, // path
    '#': 3, // wall
    '^': 4, // roof
    'D': 5, // door
    '"': 6, // tall grass
    'T': 7, // tree
    '~': 8, // water
    '_': 9, // floor
    'W': 10, // interior wall
    't': 11, // table
    'B': 12, // bed
    'S': 13, // sign
    'F': 15, // fence
    '*': 16, // flowers
    'G': 17, // gift box (the item draws itself; the ground under it is grass)
    'r': 19, // rug
    'K': 20, // bookshelf
    'X': 21, // cuttable tree (the gate)
}

const TOWN = [
    'TTTTTTTTTTTTTTTTTTTT',
    'T..................T',
    'T..................T',
    'T...^^^^....*......T',
    'T...^^^^...........T',
    'T...#D##.....*.....T',
    'T....=.............T',
    'T....=.............T',
    'T....=..*..........T',
    'T....=.S...........T',
    'T===================',
    'T.........=........T',
    'T.........=...*....T',
    'T.........=........T',
    'TFFFFFFFFFXFFFFFFFFT',
    'T.........=........T',
    'T.........=..~~~...T',
    'T....F.F..=..~~~...T',
    'T.........=........T',
    'TTTTTTTTTTTTTTTTTTTT',
]

const ROUTE = [
    'TTTTTTTTTTTTTTTTTTTT',
    'T..................T',
    'T..""".............T',
    'T..""".......""""..T',
    'T..""".......""""..T',
    'T............""""..T',
    'T..................T',
    'T.......*..........T',
    'T..................T',
    'T..................T',
    '==============.....T',
    'T............=.....T',
    'T....""""....=.....T',
    'T....""""....=.....T',
    'T....""""....=.....T',
    'T............=.....T',
    'T............=.....T',
    'T............=.....T',
    'T............=.....T',
    'TTTTTTTTTTTTTTTTTTTT',
]

const HOUSE = [
    'WWWWWWWW',
    'WKKWWWKW',
    'W______W',
    'WB__t__W',
    'W___r__W',
    'W______W',
    'W______W',
    'WWW_WWWW',
]

function tileMapFrom(rows, tilesetId, gateCells = {}) {
    const height = rows.length
    const width = rows[0].length
    const cells = width * height
    const ground = new Array(cells).fill(0)
    const overhead = new Array(cells).fill(0)
    const grass = new Array(cells).fill(0)
    const gate = new Array(cells).fill(null)

    rows.forEach((row, y) => {
        if (row.length !== width) {
            throw new Error(`row ${y} is ${row.length} wide, not ${width}`)
        }

        for (let x = 0; x < width; x++) {
            const id = LEGEND[row[x]]

            if (id === undefined) {
                throw new Error(`no tile for '${row[x]}' at ${x}, ${y}`)
            }

            // An item's gift box is drawn by the item event; the ground beneath is grass.
            ground[y * width + x] = id === 17 ? 1 : id
            grass[y * width + x] = id === 6 ? 1 : 0

            const key = `${x},${y}`

            if (gateCells[key]) {
                gate[y * width + x] = gateCells[key]
            }
        }
    })

    return {
        width,
        height,
        tilesetId,
        layers: [
            { id: crypto.randomUUID(), name: 'Ground', kind: 'ground', tiles: ground },
            { id: crypto.randomUUID(), name: 'Overhead', kind: 'overhead', tiles: overhead },
        ],
        attributes: {
            collision: new Array(cells).fill(0),
            elevation: new Array(cells).fill(0),
            ledge: new Array(cells).fill(null),
            grass,
            gate,
        },
    }
}

const cell = (x, y) => ({ x, y })

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

async function main() {
    const project = await call('GET', '/project')

    if (project.maps.some(map => map.name === 'Fernpost Town')) {
        throw new Error('Fernpost Town is already in the project. Delete it (and Fern Path, Marta\'s House) to rebuild.')
    }

    console.log('uploading art')
    const tilesSheetId = await upload('fernpost-tiles.png', tileSheet())
    const heroSheetId = await upload('fernpost-hero.png', characterSheet([72, 112, 200], [88, 56, 40]))
    const villagerSheetId = await upload('fernpost-villager.png', characterSheet([96, 168, 96], [200, 168, 88]))
    const trainerSheetId = await upload('fernpost-trainer.png', characterSheet([200, 88, 88], [40, 40, 48]))

    console.log('tileset')
    const metatiles = []

    for (let id = 1; id <= TILE_COLUMNS * TILE_ROWS; id++) {
        const column = (id - 1) % TILE_COLUMNS
        const row = Math.floor((id - 1) / TILE_COLUMNS)
        const metatile = { id, sheetId: tilesSheetId, x: column * T, y: row * T, w: T, h: T, solid: SOLID_TILES.has(id), elevation: 0, ledge: null }

        if (id === 8) {
            // Water laps between its two pictures (T-045): tile 18 is the second frame.
            metatile.animation = { frames: [{ x: 1 * T, y: 2 * T }], frameMs: 450 }
        }

        metatiles.push(metatile)
    }

    const tileset = await call('POST', '/project/tilesets', { name: 'Fernpost', metatiles })

    console.log('sprites')
    const hero = await call('POST', '/project/sprites', spriteDefinition('Fernpost Hero', heroSheetId))
    const villager = await call('POST', '/project/sprites', spriteDefinition('Fernpost Villager', villagerSheetId))
    const trainer = await call('POST', '/project/sprites', spriteDefinition('Fernpost Trainer', trainerSheetId))

    await call('PUT', '/project/player-sprite', { spriteId: hero.id })

    console.log('flags, items, dialogs')
    const tookPotion = await call('POST', '/project/flags', { name: 'Took the town Potion' })
    const hatchet = await call('POST', '/project/flags', { name: 'Marta lent her hatchet' })
    const beatIvo = await call('POST', '/project/flags', { name: 'Beat Trainer Ivo' })
    const tookBerry = await call('POST', '/project/flags', { name: 'Took the pond Berry' })

    const potion = await call('POST', '/project/items', { name: 'Potion', description: 'A bitter drink that restores a little HP.' })
    const berry = await call('POST', '/project/items', { name: 'Fern Berry', description: 'Grows by the pond. Tastes of rain.' })

    const signDialog = await call('POST', '/project/dialogs', {
        name: 'Town sign',
        pages: [
            { text: 'FERNPOST TOWN', choices: [] },
            { text: 'Where the ferns keep their posts.', choices: [] },
        ],
    })
    const martaYes = await call('POST', '/project/dialogs', {
        name: 'Marta: hatchet',
        pages: [
            { text: 'Then take it! Cut down the little tree south of the square.', choices: [], setsFlagId: hatchet.id },
            { text: 'Mind the pond. The berries there are mine, but you can have one.', choices: [] },
        ],
    })
    const martaDialog = await call('POST', '/project/dialogs', {
        name: 'Marta',
        pages: [
            { text: 'Oh, hello! Off to Fern Path?', choices: [] },
            {
                text: 'Could you use my hatchet?',
                choices: [
                    { label: 'Yes', nextDialogId: martaYes.id },
                    { label: 'No', nextDialogId: null },
                ],
            },
        ],
    })
    const ivoDialog = await call('POST', '/project/dialogs', {
        name: 'Ivo',
        pages: [{ text: 'You again? My Pebble still hurts.', choices: [] }],
    })

    console.log('moves, species, type chart, starter')
    const tackle = await call('POST', '/project/moves', { name: 'Tackle', power: 40, accuracy: 100, type: 'normal', damageClass: 'physical' })
    const leafCut = await call('POST', '/project/moves', { name: 'Leaf Cut', power: 45, accuracy: 95, type: 'grass', damageClass: 'physical' })
    const rockToss = await call('POST', '/project/moves', { name: 'Rock Toss', power: 45, accuracy: 90, type: 'rock', damageClass: 'physical' })
    const peck = await call('POST', '/project/moves', { name: 'Quick Peck', power: 35, accuracy: 100, type: 'normal', damageClass: 'physical' })
    const chirp = await call('POST', '/project/moves', { name: 'Chirp', power: 0, accuracy: 100, type: 'normal', damageClass: 'special' })

    const sprig = await call('POST', '/project/species', {
        name: 'Sprig',
        types: ['grass'],
        baseStats: { hp: 50, attack: 50, defense: 55, specialAttack: 60, specialDefense: 55, speed: 45 },
        learnset: [{ level: 1, moveId: tackle.id }, { level: 5, moveId: leafCut.id }],
    })
    const pebble = await call('POST', '/project/species', {
        name: 'Pebble',
        types: ['rock'],
        baseStats: { hp: 45, attack: 60, defense: 80, specialAttack: 30, specialDefense: 40, speed: 25 },
        learnset: [{ level: 1, moveId: tackle.id }, { level: 4, moveId: rockToss.id }],
    })
    const flit = await call('POST', '/project/species', {
        name: 'Flit',
        types: ['normal'],
        baseStats: { hp: 40, attack: 45, defense: 35, specialAttack: 35, specialDefense: 35, speed: 75 },
        learnset: [{ level: 1, moveId: peck.id }, { level: 3, moveId: chirp.id }],
    })

    await call('PUT', '/project/type-chart', {
        typeChart: {
            grass: { rock: 2 },
            rock: { grass: 0.5 },
            normal: { rock: 0.5 },
        },
    })
    await call('PUT', '/project/starter', { starter: { speciesId: sprig.id, level: 5 } })

    console.log('maps')
    const town = await call('POST', '/project/maps', { name: 'Fernpost Town' })
    const route = await call('POST', '/project/maps', { name: 'Fern Path' })
    const house = await call('POST', '/project/maps', { name: "Marta's House" })

    await call('PUT', `/project/maps/${house.id}/size`, { width: 8, height: 8 })

    await call('PUT', `/project/maps/${town.id}/tile-map`, tileMapFrom(TOWN, tileset.id, { '10,14': { flagId: hatchet.id, openMetatileId: 14 } }))
    await call('PUT', `/project/maps/${route.id}/tile-map`, tileMapFrom(ROUTE, tileset.id))
    await call('PUT', `/project/maps/${house.id}/tile-map`, tileMapFrom(HOUSE, tileset.id))

    // The town's east edge meets the route's west edge, row for row.
    await call('PUT', `/project/maps/${town.id}/connections`, { east: { mapId: route.id, offset: 0 } })
    await call('PUT', `/project/maps/${route.id}/connections`, { west: { mapId: town.id, offset: 0 } })

    await call('PUT', `/project/maps/${town.id}/events`, [
        { kind: 'warp', id: crypto.randomUUID(), cell: cell(5, 5), toMapId: house.id, toCell: cell(3, 6), facing: 'up' },
        { kind: 'sign', id: crypto.randomUUID(), cell: cell(7, 9), dialogId: signDialog.id },
        { kind: 'item', id: crypto.randomUUID(), cell: cell(12, 11), itemId: potion.id, flagId: tookPotion.id, metatileId: 17 },
        { kind: 'item', id: crypto.randomUUID(), cell: cell(14, 18), itemId: berry.id, flagId: tookBerry.id, metatileId: 17 },
        { kind: 'npc', id: crypto.randomUUID(), cell: cell(12, 7), name: 'Marta', spriteId: villager.id, facing: 'down', dialogId: martaDialog.id, behavior: 'look', trainer: null },
    ])
    await call('PUT', `/project/maps/${route.id}/events`, [
        {
            kind: 'npc', id: crypto.randomUUID(), cell: cell(9, 7), name: 'Ivo', spriteId: trainer.id, facing: 'down', dialogId: ivoDialog.id, behavior: 'still',
            trainer: { sightRange: 3, defeatedFlagId: beatIvo.id, party: [{ speciesId: flit.id, level: 2 }, { speciesId: pebble.id, level: 3 }] },
        },
    ])
    await call('PUT', `/project/maps/${house.id}/events`, [
        { kind: 'warp', id: crypto.randomUUID(), cell: cell(3, 7), toMapId: town.id, toCell: cell(5, 6), facing: 'down' },
        { kind: 'heal', id: crypto.randomUUID(), cell: cell(1, 3) },
    ])

    await call('PUT', `/project/maps/${route.id}/encounters`, {
        rate: 15,
        entries: [
            { speciesId: pebble.id, minLevel: 2, maxLevel: 4, weight: 50 },
            { speciesId: flit.id, minLevel: 2, maxLevel: 3, weight: 40 },
            { speciesId: sprig.id, minLevel: 3, maxLevel: 3, weight: 10 },
        ],
    })

    await call('PUT', '/project/start-map', { mapId: town.id })

    console.log(`done. Open ${API}/play and read docs/sample-town.md.`)
}

main().catch(error => {
    console.error(error.message)
    process.exit(1)
})
