import type { Layer } from 'Model/Layer'

function hasStringUuid(value: unknown): boolean {
    return typeof value === 'object'
        && value !== null
        && typeof (value as { uuid?: unknown }).uuid === 'string'
}

export function isLayerList(value: unknown): value is Layer[] {
    return Array.isArray(value) && value.every(hasStringUuid)
}
