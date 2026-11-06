/**
 * The lower-cased extension of `filename` when it is in `allowed`, else undefined.
 * Only the characters after the last dot are read, so a directory or `..` in the
 * name never reaches the disk path.
 */
export function allowedExtension(
    filename: string,
    allowed: readonly string[],
): string | undefined {
    const dot = filename.lastIndexOf('.')

    if (dot === -1) {
        return undefined
    }

    const extension = filename.slice(dot).toLowerCase()

    if (!/^\.[a-z0-9]+$/.test(extension)) {
        return undefined
    }

    return allowed.includes(extension) ? extension : undefined
}
