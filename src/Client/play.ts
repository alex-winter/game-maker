import './play.css'
import { Dom } from 'Client/Service/Dom'
import { loadLegacyPlacements } from 'Client/Service/load-legacy-placements'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'
import { sheetRepository } from 'Client/Service/Repository/SheetRepository'
import { MAP_QUERY_PARAM } from 'Client/Service/active-map'
import { buildScene } from 'Client/Service/build-scene'
import { canvasDrawPort } from 'Client/Service/canvas-draw-port'
import { HeldDirections } from 'Client/Service/held-directions'
import { GameMap, Project, findDialog, findItem, findMap, findMove, findSpecies, findSprite, playerSprite, startMap } from 'domain/project'
import { isGrassAt, isSolid, withOpenGates } from 'domain/map'
import { hasFlag, Memory } from 'domain/flags'
import { Scene } from 'engine/scene'
import { DrawPort, PortSize } from 'engine/draw-port'
import { CanEnter } from 'domain/movement'
import { Id } from 'domain/id'
import { stepRule } from 'domain/collision'
import { GRID_SIZE } from 'domain/grid'
import { Direction, insideMap, Player, playerPixel } from 'domain/movement'
import { LoadedPlacement } from 'Client/Model/LoadedPlacement'
import { cameraFor, GBA_VIEW, integerScale } from 'engine/camera'
import { fadeOpacity } from 'engine/fade'
import { advanceField, afterBattle, afterSave, dismissBattle, FieldState, FieldWorld, itemsOnMap, newField, npcMover, restoreField, snapshotField, Transition } from 'engine/field'
import { startLoop } from 'engine/loop'
import { playerActor } from 'engine/player-actor'
import { renderFrame } from 'engine/render'
import { currentPage, drawMessageBox, MessageState, moveHighlight, openMessage } from 'engine/message'
import { newPage } from 'domain/dialog'
import { saveRepository } from 'Client/Service/Repository/SaveRepository'
import { SavedSession } from 'domain/save'
import { drawMenu, MenuEntry } from 'engine/menu'
import { drawBagScreen } from 'engine/bag-screen'
import { drawPartyScreen, PartyLookup } from 'engine/party-screen'
import { itemActor } from 'engine/item-actor'
import { npcActor, SpriteLookup } from 'engine/npc-actor'
import { npcsOn } from 'domain/warp'
import { starterParty } from 'domain/creature'
import { BattleData, battleResult, newBattle } from 'domain/battle'
import { advanceBattleScene, BattleSceneState, drawBattleScene, isBattleOver, newBattleScene } from 'engine/battle-scene'
import { View } from 'engine/view'

const held = new HeldDirections()

/** Held while a direction is held, like B on the GBA, to run instead of walk. */
let running = false

/** Set on the interact key's keydown and consumed by the next frame, so one press is one look. */
let interactPressed = false
let menuPressed = false

/** The direction key pressed this frame (an edge, unlike `held`), for menus that step one row per press. */
let directionPressed: Direction | null = null

const directionByCode: { readonly [code: string]: Direction | undefined } = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    KeyW: 'up',
    KeyS: 'down',
    KeyA: 'left',
    KeyD: 'right',
}

const RUN_CODES: readonly string[] = ['ShiftLeft', 'ShiftRight', 'KeyX']

/** A, like the GBA: Z or Space. */
const INTERACT_CODES: readonly string[] = ['KeyZ', 'Space']

/** Start, like the GBA: Enter or Escape opens and closes the field menu. */
const MENU_CODES: readonly string[] = ['Enter', 'Escape']

/** Menu entries that open something today. The rest show greyed until their tickets land. */
const ENABLED_ENTRIES: ReadonlySet<MenuEntry> = new Set(['bag', 'party', 'save', 'close'])

function releaseAllKeys(): void {
    held.clear()
    running = false
    interactPressed = false
    menuPressed = false
}

/**
 * The canvas is the 240×160 view at the largest whole scale that fits the
 * window; the page's black body is the letterbox around it. Returns the scale.
 */
function fitCanvasToWindow(canvas: HTMLCanvasElement): number {
    const scale = integerScale({ width: window.innerWidth, height: window.innerHeight })

    canvas.width = GBA_VIEW.width * scale
    canvas.height = GBA_VIEW.height * scale

    return scale
}

/** The view that keeps the player's cell centred until the map edge stops it. */
function followPlayer(player: Player, mapPixels: { width: number; height: number }, zoom: number): View {
    const pixel = playerPixel(player)
    const camera = cameraFor({ x: pixel.x + GRID_SIZE / 2, y: pixel.y + GRID_SIZE / 2 }, GBA_VIEW, mapPixels)

    return { ...camera, zoom }
}

async function loadSheets(): Promise<Map<Id, CanvasImageSource>> {
    const sheets = await sheetRepository.getAll()
    const images = await Promise.all(sheets.map(sheet => Dom.image(sheet.imageSrc)))

    return new Map(sheets.map((sheet, index) => [sheet.id, images[index]]))
}

/**
 * The map the session opens: `?map=<id>` when the editor asked to try a
 * particular map, else the project's start map (or its first map).
 */
function sessionMap(search: string, project: Project) {
    const requested = new URLSearchParams(search).get(MAP_QUERY_PARAM)
    const tried = requested === null ? undefined : findMap(project, requested)

    return tried ?? startMap(project)
}

/** Everything the loop needs to draw the map the player is on. Rebuilt when they cross to another. */
type OpenMap = {
    readonly map: GameMap

    readonly scene: Scene<CanvasImageSource>

    readonly pixels: PortSize
}

/** The within-map rule: collision, elevation, ledges, and gates the session's flags open (T-050), or only the edge for a map without a tileset. */
function ruleFor(map: GameMap, memory: Memory): CanEnter {
    const tileset = projectRepository.cachedTileset(map.tileMap.tilesetId)

    return tileset === undefined ? insideMap(map.tileMap) : stepRule(map.tileMap, tileset, flagId => hasFlag(memory, flagId))
}

/** Answers the field session's questions from the loaded project. */
function worldOf(project: Project, home: Transition): FieldWorld {
    // The rule is rebuilt only when the flags change: a gate opening is the one thing that moves it.
    const rules = new Map<Id, { flags: Memory['flags']; rule: CanEnter }>()

    return {
        sizeOf: mapId => findMap(project, mapId)?.tileMap,
        canEnter: (mapId, memory) => {
            const cached = rules.get(mapId)

            if (cached !== undefined && cached.flags === memory.flags) {
                return cached.rule
            }

            const map = findMap(project, mapId)
            const rule: CanEnter = map === undefined ? () => false : ruleFor(map, memory)

            rules.set(mapId, { flags: memory.flags, rule })

            return rule
        },
        isSolidAt: (mapId, cell) => {
            const map = findMap(project, mapId)
            const tileset = map === undefined ? undefined : projectRepository.cachedTileset(map.tileMap.tilesetId)

            return map !== undefined && tileset !== undefined && isSolid(map.tileMap, tileset, cell)
        },
        connectionsOf: mapId => findMap(project, mapId)?.connections ?? {},
        eventsOf: mapId => findMap(project, mapId)?.events ?? [],
        pagesOf: dialogId => findDialog(project, dialogId)?.pages,
        itemOf: itemId => findItem(project, itemId),
        random: Math.random,
        isGrassAt: (mapId, cell) => {
            const map = findMap(project, mapId)

            return map !== undefined && isGrassAt(map.tileMap, cell)
        },
        encountersOf: mapId => findMap(project, mapId)?.encounters,
        speciesName: speciesId => findSpecies(project, speciesId)?.name,
        speciesOf: speciesId => findSpecies(project, speciesId),
        home,
    }
}

function openMap(
    map: GameMap,
    sheetById: ReadonlyMap<Id, CanvasImageSource>,
    legacyPlacements: ReadonlyMap<Id, readonly LoadedPlacement[]>,
    memory: Memory,
): OpenMap {
    const scene = buildScene({
        // Gates the session has opened show their open picture (T-050).
        tileMap: withOpenGates(map.tileMap, flagId => hasFlag(memory, flagId)),
        tileset: projectRepository.cachedTileset(map.tileMap.tilesetId),
        sheetById,
        layers: map.layers,
        loadedPlacements: legacyPlacements.get(map.id) ?? [],
    })

    return {
        map,
        scene,
        pixels: { width: map.tileMap.width * GRID_SIZE, height: map.tileMap.height * GRID_SIZE },
    }
}

/** The boot question when a save exists: continue it or start over. Drawn with the message box on black. */
const CONTINUE = 'continue'
const NEW_GAME = 'new-game'

function bootQuestion(): MessageState {
    return openMessage([newPage('A saved game was found.', [
        { label: 'Continue', nextDialogId: CONTINUE },
        { label: 'New game', nextDialogId: NEW_GAME },
    ])])
}

/**
 * Shows the boot question until the player confirms. Resolves to the saved
 * session to resume, or undefined for a new game (the save is forgotten).
 */
function askToContinue(port: DrawPort<CanvasImageSource>, zoomOf: () => number, saved: SavedSession): Promise<SavedSession | undefined> {
    return new Promise(resolve => {
        let question = bootQuestion()
        let lastDirection: Direction | null = null

        const stop = startLoop(() => {
            const direction = held.latest()
            const pressed = direction !== null && direction !== lastDirection ? direction : null

            lastDirection = direction
            question = pressed === 'up' ? moveHighlight(question, -1) : pressed === 'down' ? moveHighlight(question, 1) : question

            const confirmed = interactPressed

            interactPressed = false
            menuPressed = false
            port.clear()
            drawMessageBox(port, question, GBA_VIEW, zoomOf())

            if (confirmed) {
                const choice = currentPage(question).choices[question.highlight]

                stop()
                resolve(choice?.nextDialogId === CONTINUE ? saved : undefined)
            }
        }, callback => window.requestAnimationFrame(callback))
    })
}

/** A plain message in place of the canvas, for a project that cannot start. */
function showMessage(canvas: HTMLCanvasElement, text: string): void {
    const message = document.createElement('p')

    message.className = 'message'
    message.textContent = text
    canvas.replaceWith(message)
}

document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.querySelector('canvas')
    const ctx = canvas?.getContext('2d')

    if (!canvas || !ctx) {
        return
    }

    let zoom = fitCanvasToWindow(canvas)

    window.addEventListener('resize', () => {
        zoom = fitCanvasToWindow(canvas)
    })

    const project = await projectRepository.load()
    const startAt = sessionMap(window.location.search, project)

    if (startAt === undefined) {
        showMessage(canvas, 'This project has no maps to play. Create one in the editor and mark it as the start map.')
        return
    }

    const sheetById = await loadSheets()
    const sprite = playerSprite(project)
    const spriteSheet = sprite === undefined ? undefined : sheetById.get(sprite.sheetId)
    // Legacy placements for every map up front, so crossing a seam never waits on the network.
    const legacyPlacements = new Map<Id, readonly LoadedPlacement[]>(
        await Promise.all(project.maps.map(async each => [each.id, await loadLegacyPlacements(each.layers)] as const)),
    )
    const port = canvasDrawPort(ctx)
    const world = worldOf(project, { mapId: startAt.id, cell: startAt.spawn, facing: 'down' })
    const spriteLookup: SpriteLookup<CanvasImageSource> = spriteId => {
        const definition = findSprite(project, spriteId)
        const image = definition === undefined ? undefined : sheetById.get(definition.sheetId)

        return definition === undefined || image === undefined ? undefined : { sprite: definition, image }
    }
    // The editor's "try this map" starts fresh there; otherwise a save, if any, offers to continue.
    const tryingMap = new URLSearchParams(window.location.search).has(MAP_QUERY_PARAM)
    const saved = tryingMap ? undefined : await saveRepository.load()
    const resume = saved === undefined ? undefined : await askToContinue(port, () => zoom, saved)

    if (saved !== undefined && resume === undefined) {
        await saveRepository.forget()
    }

    const savedMap = resume === undefined ? undefined : findMap(project, resume.mapId)
    const map = savedMap ?? startAt
    // A new game carries the authored starter (T-047); a resumed one carries whatever was saved.
    let field: FieldState = resume !== undefined && savedMap !== undefined ? restoreField(resume) : newField(map.id, map.spawn, 'down', undefined, undefined, starterParty(project.starter, project.species))
    let open = openMap(map, sheetById, legacyPlacements, field.memory)
    let shownFlags = field.memory.flags

    // The session clock animated tiles follow: it runs on through fades and menus so water never stutters.
    let clockMs = 0

    const battleData: BattleData = { moves: project.moves, typeChart: project.typeChart }
    const speciesOf = (speciesId: Id) => findSpecies(project, speciesId)
    const partyLookup: PartyLookup = { speciesOf, moveName: moveId => findMove(project, moveId)?.name }

    // The battle scene the field handed off to (T-053), or undefined while the field runs.
    let battleScene: BattleSceneState | undefined

    startLoop(deltaSeconds => {
        clockMs += deltaSeconds * 1000

        if (battleScene !== undefined) {
            // The scene owns the frame until the result is read; then the field tells the end of the story.
            battleScene = advanceBattleScene(battleScene, { up: directionPressed === 'up', down: directionPressed === 'down', interact: interactPressed, cancel: menuPressed }, battleData, Math.random)
            interactPressed = false
            menuPressed = false
            directionPressed = null

            if (isBattleOver(battleScene)) {
                field = afterBattle(field, battleResult(battleScene.battle), world)
                battleScene = undefined
            } else {
                drawBattleScene(port, battleScene, battleData, GBA_VIEW, zoom)
                return
            }
        }

        field = advanceField(field, { direction: held.latest(), running, interact: interactPressed, menu: menuPressed }, deltaSeconds * 1000, world)
        interactPressed = false
        menuPressed = false
        directionPressed = null

        // The grass rustled or a trainer walked up: open the scene (T-053). A request the scene cannot open — its species gone from the project — is dropped with a word.
        if (field.battle !== undefined) {
            const battle = newBattle(field.battle, speciesOf)

            if (battle === undefined) {
                field = dismissBattle(field)
            } else {
                battleScene = newBattleScene(battle, field.battle.trainer)
            }
        }

        if (field.menuChoice === 'save') {
            void saveRepository.save(snapshotField(field))
            field = afterSave(field)
        }

        // The session changed map at the black point of a fade: draw the new one from now on.
        if (field.mapId !== open.map.id || field.memory.flags !== shownFlags) {
            const next = findMap(project, field.mapId)

            if (next !== undefined) {
                open = openMap(next, sheetById, legacyPlacements, field.memory)
                shownFlags = field.memory.flags
            }
        }

        const player = field.player

        const items = itemsOnMap(open.map.events, field.memory).map(item => itemActor(item, open.scene.tileset, sheetById))
        const people = npcsOn(open.map.events).map(npc => npcActor(npc, npcMover(field, npc), spriteLookup))

        renderFrame(port, open.scene, followPlayer(player, open.pixels, zoom), [...items, ...people, playerActor(player, sprite, spriteSheet)], clockMs)

        if (field.message !== null) {
            drawMessageBox(port, field.message, GBA_VIEW, zoom)
        }

        if (field.bagScreen !== null) {
            drawBagScreen(port, field.bag, world.itemOf, field.bagScreen, GBA_VIEW, zoom)
        } else if (field.partyScreen !== null) {
            drawPartyScreen(port, field.party, partyLookup, field.partyScreen, GBA_VIEW, zoom)
        } else if (field.menu !== null) {
            drawMenu(port, field.menu, GBA_VIEW, zoom, ENABLED_ENTRIES)
        }

        const darkness = fadeOpacity(field.fade)

        if (darkness > 0) {
            port.fillRect(0, 0, port.width, port.height, `rgba(0, 0, 0, ${darkness.toFixed(3)})`)
        }
    }, callback => window.requestAnimationFrame(callback))
})

window.addEventListener('keydown', (event: KeyboardEvent) => {
    const direction = directionByCode[event.code]

    if (direction) {
        event.preventDefault()
        held.press(direction)

        if (!event.repeat) {
            directionPressed = direction
        }
    }

    if (RUN_CODES.includes(event.code)) {
        running = true
    }

    if (INTERACT_CODES.includes(event.code) && !event.repeat) {
        event.preventDefault()
        interactPressed = true
    }

    if (MENU_CODES.includes(event.code) && !event.repeat) {
        event.preventDefault()
        menuPressed = true
    }
})

window.addEventListener('keyup', (event: KeyboardEvent) => {
    const direction = directionByCode[event.code]

    if (direction) {
        held.release(direction)
    }

    if (RUN_CODES.includes(event.code)) {
        running = false
    }
})

window.addEventListener('blur', releaseAllKeys)
