import fs from 'fs'
import { defaultProject, Project, projectFromLegacyLayers } from 'domain/project'
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
    if (fs.existsSync(config.projectFileDir)) {
        return
    }

    const project = fs.existsSync(config.legacyLayersJsonFileDir)
        ? projectFromLegacyLayers(readJson<Layer[]>(config.legacyLayersJsonFileDir))
        : defaultProject()

    writeJson(config.projectFileDir, project)
}

export function readProject(): Project {
    return readJson<Project>(config.projectFileDir)
}

export function writeProject(project: Project): void {
    writeJson(config.projectFileDir, project)
}
