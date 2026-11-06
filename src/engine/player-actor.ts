import { GRID_SIZE } from '../domain/grid'
import { Player, playerPixel, stepProgress } from '../domain/movement'
import { pickFrame, SpriteDefinition } from '../domain/sprite'
import { Actor } from './scene'

/** The stand-in colour while no sprite is assigned to the player. */
export const PLAYER_COLOR = '#ff5252'

/**
 * The actor that draws the player this frame. A sprite stands on its cell:
 * its bottom edge is the cell's bottom edge, so a 16×32 frame overhangs the
 * cell above. Without a sprite the player is one red cell.
 */
export function playerActor<TImage>(player: Player, sprite: SpriteDefinition | undefined, image: TImage | undefined): Actor<TImage> {
    const pixel = playerPixel(player)

    if (sprite === undefined || image === undefined) {
        return { ...pixel, width: GRID_SIZE, height: GRID_SIZE, color: PLAYER_COLOR }
    }

    const frame = pickFrame(sprite, player.facing, stepProgress(player), player.step === null)

    return {
        x: pixel.x + Math.floor((GRID_SIZE - sprite.frameWidth) / 2),
        y: pixel.y + GRID_SIZE - sprite.frameHeight,
        width: sprite.frameWidth,
        height: sprite.frameHeight,
        color: PLAYER_COLOR,
        sprite: { image, sx: frame.x, sy: frame.y, sw: frame.width, sh: frame.height },
    }
}
