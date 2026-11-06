/** A dataset after `Dom.makeComponent` encoded it: strings stay strings; objects, arrays, booleans, and null are parsed back. */
export type ParsedDataset = { readonly [key: string]: unknown }

function looksLikeJsonContainer(value: string): boolean {
    const first = value.trimStart()[0]

    return first === '{' || first === '['
}

/** The JSON literals a boolean or null become on the way in. Numbers stay text: "42" may be a name. */
function isJsonLiteral(value: string): boolean {
    return value === 'true' || value === 'false' || value === 'null'
}

/** Parses the values `Dom.makeComponent` JSON-encoded. Other strings pass through unchanged. */
export function parseDataset(dataset: { readonly [key: string]: string | undefined }): ParsedDataset {
    const parsed: { [key: string]: unknown } = {}

    for (const [key, value] of Object.entries(dataset)) {
        if (value === undefined) {
            continue
        }

        if (!looksLikeJsonContainer(value) && !isJsonLiteral(value)) {
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
