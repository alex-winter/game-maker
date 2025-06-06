import { LoadedPlacement } from 'Client/Model/LoadedPlacement'
import { Events } from 'Client/Service/Events'
import { Coordinates } from 'Model/Coordinates'

class LoadedPlacementRepository {
    private readonly data: LoadedPlacement[] = []

    public add(...loadedPlacement: LoadedPlacement[]): void {
        this.data.push(...loadedPlacement)
    }

    public get(): LoadedPlacement[] {
        return this.data
    }

    public getByUuid(uuid: string): LoadedPlacement | undefined {
        return this.data.find(p => p.uuid === uuid)
    }

    public removeByUuid(uuid: string): void {
        const index = this.data.findIndex(p => p.uuid === uuid)
        if (index !== -1) {
            this.data.splice(index, 1)
        }
    }
}

export const loadedPlacementRepository = new LoadedPlacementRepository()