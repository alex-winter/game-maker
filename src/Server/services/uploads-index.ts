import fs from 'fs'
import { UploadedSheet } from 'Model/UploadedSheet'
import { config } from 'Server/config'
import { readJson } from 'Server/services/read-json'
import { writeJson } from 'Server/services/write-json'

/** The original names of stored uploads. A missing index is an empty one. */
export function readUploadsIndex(): UploadedSheet[] {
    if (!fs.existsSync(config.uploadsIndexFileDir)) {
        return []
    }

    return readJson<UploadedSheet[]>(config.uploadsIndexFileDir)
}

export function appendToUploadsIndex(sheets: UploadedSheet[]): void {
    writeJson(config.uploadsIndexFileDir, [...readUploadsIndex(), ...sheets])
}
