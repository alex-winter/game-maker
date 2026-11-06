import { Rect } from './coordinates'
import { Id } from './id'
import { Direction, isDirection } from './movement'

/** The frames for one facing: a standing pose and the walk cycle, each a pixel rectangle on the sheet. */
export type DirectionFrames = {
    idle: Rect

    walk: Rect[]
}

/**
 * A character's look: one sheet and, per direction, an idle frame and a walk
 * cycle. The player and later NPCs (T-042) share this type.
 */
export type SpriteDefinition = {
    readonly id: Id

    name: string

    sheetId: Id

    /** Every frame is this big; the actor rectangle takes this size too. */
    frameWidth: number

    frameHeight: number

    directions: { [D in Direction]: DirectionFrames }
}

/** A gen 3 overworld character is one cell wide and two tall. */
export const DEFAULT_FRAME_SIZE = { width: 16, height: 32 }

export const DIRECTIONS: readonly Direction[] = ['down', 'up', 'left', 'right']

/** A definition with every direction pointing at the sheet's first frame, for the author to fill in. */
export function newSpriteDefinition(id: Id, name: string, sheetId: Id, frameWidth: number, frameHeight: number): SpriteDefinition {
    const first: Rect = { x: 0, y: 0, width: frameWidth, height: frameHeight }

    return {
        id,
        name,
        sheetId,
        frameWidth,
        frameHeight,
        directions: {
            down: { idle: { ...first }, walk: [] },
            up: { idle: { ...first }, walk: [] },
            left: { idle: { ...first }, walk: [] },
            right: { idle: { ...first }, walk: [] },
        },
    }
}

/**
 * The frame to draw. Idle, or a direction with no walk frames, shows the
 * idle pose. While stepping, `phase` in [0, 1) indexes the walk cycle
 * evenly: two frames switch at 0.5, four at each quarter.
 */
export function pickFrame(definition: SpriteDefinition, direction: Direction, phase: number, idle: boolean): Rect {
    const frames = definition.directions[direction]

    if (idle || frames.walk.length === 0) {
        return frames.idle
    }

    const index = Math.min(frames.walk.length - 1, Math.max(0, Math.floor(phase * frames.walk.length)))

    return frames.walk[index]
}

/** Points one slot of one direction at a frame. `slot` is 'idle' or a walk index; an index past the end appends. */
export function withFrame(definition: SpriteDefinition, direction: Direction, slot: 'idle' | number, frame: Rect): SpriteDefinition {
    const frames = definition.directions[direction]
    const next: DirectionFrames = slot === 'idle'
        ? { ...frames, idle: frame }
        : { ...frames, walk: slot >= frames.walk.length ? [...frames.walk, frame] : frames.walk.map((f, i) => i === slot ? frame : f) }

    return { ...definition, directions: { ...definition.directions, [direction]: next } }
}

export function withoutWalkFrame(definition: SpriteDefinition, direction: Direction, index: number): SpriteDefinition {
    const frames = definition.directions[direction]

    return {
        ...definition,
        directions: { ...definition.directions, [direction]: { ...frames, walk: frames.walk.filter((_, i) => i !== index) } },
    }
}

function isRect(value: unknown): value is Rect {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const rect = value as { [K in keyof Rect]?: unknown }

    return Number.isInteger(rect.x) && Number.isInteger(rect.y)
        && Number.isInteger(rect.width) && Number.isInteger(rect.height)
        && (rect.width as number) > 0 && (rect.height as number) > 0
}

function isDirectionFrames(value: unknown): value is DirectionFrames {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const frames = value as { idle?: unknown; walk?: unknown }

    return isRect(frames.idle) && Array.isArray(frames.walk) && frames.walk.every(isRect)
}

/** Structural check for a definition sent to the server; the id is checked by the caller. */
export function isSpriteDefinitionInput(value: unknown): value is Omit<SpriteDefinition, 'id'> {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const sprite = value as { [K in keyof SpriteDefinition]?: unknown }

    if (typeof sprite.name !== 'string' || sprite.name.trim().length === 0 || typeof sprite.sheetId !== 'string') {
        return false
    }

    if (!Number.isInteger(sprite.frameWidth) || !Number.isInteger(sprite.frameHeight)
        || (sprite.frameWidth as number) <= 0 || (sprite.frameHeight as number) <= 0) {
        return false
    }

    const directions = sprite.directions

    if (typeof directions !== 'object' || directions === null) {
        return false
    }

    const keys = Object.keys(directions)

    return keys.length === DIRECTIONS.length
        && keys.every(isDirection)
        && Object.values(directions).every(isDirectionFrames)
}
