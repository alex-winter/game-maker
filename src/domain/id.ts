/** An identifier for a new map, layer, tile, or actor. Never derived from a display name. */
export type Id = string

/** A fresh random id. `crypto` is global in the browser and in Node 19 and later. */
export function newId(): Id {
    return crypto.randomUUID()
}
