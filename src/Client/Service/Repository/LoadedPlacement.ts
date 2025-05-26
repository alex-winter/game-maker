import { LoadedPlacement } from 'Client/Model/LoadedPlacement'

class LoadedPlacementRepository {
    private readonly data: LoadedPlacement[] = []

    public add(...loadedPlacement: LoadedPlacement[]): void {
        this.data.push(...loadedPlacement)
    }

    public get(): LoadedPlacement[] {
        return this.data
    }
}

export const loadedPlacementRepository = new LoadedPlacementRepository()