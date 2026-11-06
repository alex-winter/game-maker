const MIME_BY_EXTENSION: { readonly [extension: string]: string | undefined } = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
}

/** The MIME type for a stored sheet file, by its extension. */
export function imageMimeType(filename: string): string | undefined {
    const dot = filename.lastIndexOf('.')

    if (dot === -1) {
        return undefined
    }

    return MIME_BY_EXTENSION[filename.slice(dot).toLowerCase()]
}
