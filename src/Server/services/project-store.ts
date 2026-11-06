import fs from 'fs'
import { defaultProject, Project, projectFromLegacyLayers, withProjectDefaults } from 'domain/project'
import type { Layer } from 'Model/Layer'
import { config } from 'Server/config'
import { readJson } from 'Server/services/read-json'
import { writeJson } from 'Server/services/write-json'

/**
 * Creates `data/project.json` on first boot. A pre-project `layers.json`
 * is imported once as a legacy map and then left alone; later boots read
 * only the project file.
 */
export function ensureProjectFile(): void {
    if (!fs.existsSync(config.projectFileDir)) {
        const project = fs.existsSync(config.legacyLayersJsonFileDir)
            ? projectFromLegacyLayers(readJson<Layer[]>(config.legacyLayersJsonFileDir))
            : defaultProject()

        writeJson(config.projectFileDir, project)
    }

    // Fields added since the file was written are filled on read; store them
    // once so generated ids (new tile layers) stay stable across requests.
    writeProject(readProject())
}

export function readProject(): Project {
    return withProjectDefaults(readJson<Project>(config.projectFileDir))
}

export function writeProject(project: Project): void {
    writeJson(config.projectFileDir, project)
}
