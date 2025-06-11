import fs from 'fs'
import { writeJson } from 'Server/services/write-json'

export const createDataFile = (dir: string, data: any = []): void => {
    if (!fs.existsSync(dir)) {
        writeJson(dir, data)
    }
}