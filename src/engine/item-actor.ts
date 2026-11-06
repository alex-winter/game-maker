import { GRID_SIZE } from '../domain/grid'
import { Id } from '../domain/id'
import { metatileById, Tileset } from '../domain/tileset'
import { ItemEvent } from '../domain/warp'
import { Actor } from './scene'

/** The stand-in colour for an item whose metatile is missing or unset. */
export const ITEM_COLOR = '#4caf50'

/**
 * The actor that draws an item still lying on its cell: the metatile the
 * author chose, cut from its sheet, or a green cell when there is none.
 */
export function itemActor<TImage>(event: ItemEvent, tileset: Tileset | undefined, sheetById: ReadonlyMap<Id, TImage>): Actor<TImage> {
    const cell = { x: event.cell.x * GRID_SIZE, y: event.cell.y * GRID_SIZE, width: GRID_SIZE, height: GRID_SIZE }
    const metatile = event.metatileId === null || tileset === undefined ? undefined : metatileById(tileset, event.metatileId)
    const image = metatile === undefined ? undefined : sheetById.get(metatile.sheetId)

    if (metatile === undefined || image === undefined) {
        return { ...cell, color: ITEM_COLOR }
    }

    return { ...cell, color: ITEM_COLOR, sprite: { image, sx: metatile.x, sy: metatile.y, sw: metatile.w, sh: metatile.h } }
}
