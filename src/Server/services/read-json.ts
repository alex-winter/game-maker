import fs from 'fs'

export function readJson<T>(filePath: string): T {
    const content = fs.readFileSync(filePath, 'utf-8')

    return JSON.parse(content)
}