import fs from 'fs'

export type AtomicWriteFs = {
    readonly write: (path: string, content: string) => void

    readonly rename: (from: string, to: string) => void

    readonly remove: (path: string) => void
}

/** The sibling a write lands in before it is renamed over the target. */
export function temporaryPathFor(filePath: string): string {
    return filePath + '.tmp'
}

/**
 * Writes `content` to a temporary sibling, then renames it over `filePath`.
 * Rename within one directory is atomic on the filesystems this runs on, so
 * a reader sees the old document or the new one, never a partial one.
 * If the write throws, the temporary file is removed and the target is untouched.
 *
 * One server process is assumed; this does not lock against other processes.
 */
export function writeAtomically(filePath: string, content: string, io: AtomicWriteFs): void {
    const temporaryPath = temporaryPathFor(filePath)

    try {
        io.write(temporaryPath, content)
    } catch (error) {
        io.remove(temporaryPath)
        throw error
    }

    io.rename(temporaryPath, filePath)
}

const nodeFs: AtomicWriteFs = {
    write: (path, content) => fs.writeFileSync(path, content),
    rename: (from, to) => fs.renameSync(from, to),
    remove: path => fs.rmSync(path, { force: true }),
}

export function writeJson<T>(filePath: string, data: T): void {
    writeAtomically(filePath, JSON.stringify(data, null, 2), nodeFs)
}
