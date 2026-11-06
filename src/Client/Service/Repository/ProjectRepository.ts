import { Repository } from 'Client/Service/Repository/Repository'
import { Id } from 'domain/id'
import { GameMap, Project } from 'domain/project'

class ProjectRepository extends Repository {
    private readonly API_PATH = '/project'

    private project: Project | undefined

    public async load(): Promise<Project> {
        if (this.project === undefined) {
            this.project = await this.get<Project>(this.API_PATH)
        }

        return this.project
    }

    public async createMap(name: string): Promise<GameMap> {
        const response = await this.post(this.API_PATH + '/maps', { name })
        const map: GameMap = await response.json()

        this.project?.maps.push(map)

        return map
    }

    public async renameMap(mapId: Id, name: string): Promise<GameMap> {
        const response = await this.patch(this.API_PATH + '/maps/' + mapId, { name })
        const renamed: GameMap = await response.json()
        const cached = this.project?.maps.find(map => map.id === mapId)

        if (cached) {
            cached.name = renamed.name
        }

        return renamed
    }
}

export const projectRepository = new ProjectRepository()
