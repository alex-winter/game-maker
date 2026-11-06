/** The URL the browser loads a stored sheet file from. The server mounts the uploads directory here. */
export const ASSETS_PATH = '/assets'

export function assetUrl(storedFilename: string): string {
    return `${ASSETS_PATH}/${encodeURIComponent(storedFilename)}`
}
