import { GRID_SIZE } from '../domain/grid'
import { Id } from '../domain/id'
import { Player, playerPixel, stepProgress } from '../domain/movement'
import { pickFrame, SpriteDefinition } from '../domain/sprite'
import { NpcEvent } from '../domain/warp'
import { Actor } from './scene'

/** The stand-in colour for a person without a sprite. */
export const NPC_COLOR = '#3f51b5'

/** Finds a sprite and its decoded sheet by id; hosts answer from the project. */
export type SpriteLookup<TImage> = (spriteId: Id) => { readonly sprite: SpriteDefinition; readonly image: TImage } | undefined

/**
 * The actor that draws a person where their `mover` is — standing on a cell
 * or part way through a step, facing the mover's way (their own, a turn
 * while looking around, or toward the player in a conversation): the
 * sprite's pose, placed like the player's, or a blue cell without a sprite.
 */
export function npcActor<TImage>(npc: NpcEvent, mover: Player, lookup: SpriteLookup<TImage>): Actor<TImage> {
    const pixel = playerPixel(mover)
    const look = npc.spriteId === null ? undefined : lookup(npc.spriteId)

    if (look === undefined) {
        return { ...pixel, width: GRID_SIZE, height: GRID_SIZE, color: NPC_COLOR }
    }

    const frame = pickFrame(look.sprite, mover.facing, stepProgress(mover), mover.step === null)

    return {
        x: pixel.x + Math.floor((GRID_SIZE - look.sprite.frameWidth) / 2),
        y: pixel.y + GRID_SIZE - look.sprite.frameHeight,
        width: look.sprite.frameWidth,
        height: look.sprite.frameHeight,
        color: NPC_COLOR,
        sprite: { image: look.image, sx: frame.x, sy: frame.y, sw: frame.width, sh: frame.height },
    }
}
