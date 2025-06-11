import fs from 'fs'

export function writeJson<T>(
    filePath: string,
    data: T,
) {
    fs.writeFileSync(
        filePath,
        JSON.stringify(data, null, 2),
    )
}