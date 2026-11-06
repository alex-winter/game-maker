/** A dataset after `Dom.makeComponent` encoded it: strings stay strings, objects and arrays are parsed back. */
export type ParsedDataset = { readonly [key: string]: unknown }

function looksLikeJsonContainer(value: string): boolean {
    const first = value.trimStart()[0]

    return first === '{' || first === '['
}

/** Parses the values `Dom.makeComponent` JSON-encoded. Other strings pass through unchanged. */
export function parseDataset(dataset: { readonly [key: string]: string | undefined }): ParsedDataset {
    const parsed: { [key: string]: unknown } = {}

    for (const [key, value] of Object.entries(dataset)) {
        if (value === undefined) {
            continue
        }

        if (!looksLikeJsonContainer(value)) {
            parsed[key] = value
            continue
        }

        try {
            parsed[key] = JSON.parse(value)
        } catch {
            parsed[key] = value
        }
    }

    return parsed
}
