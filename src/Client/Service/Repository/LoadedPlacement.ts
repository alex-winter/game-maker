import { LoadedPlacement } from 'Client/Model/LoadedPlacement'
import { Events } from 'Client/Service/Events'

class LoadedPlacementRepository {
    private readonly data: LoadedPlacement[] = []

    public add(...loadedPlacement: LoadedPlacement[]): void {
        this.data.push(...loadedPlacement)

        Events.emit('loaded-placement-added')
    }

    public get(): LoadedPlacement[] {
        return this.data
    }
}

export const loadedPlacementRepository = new LoadedPlacementRepository()