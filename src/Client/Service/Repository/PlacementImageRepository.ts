import { PlacementImage } from 'Model/Placement'
import { Repository } from 'Client/Service/Repository/Repository'

/** Read-only since T-020: the pictures legacy placements point at. Nothing creates new ones. */
class PlacementImageRepository extends Repository {
    private readonly API_PATH: string = '/placement-images'
    private dataPromise: Promise<PlacementImage[]> | undefined

    public getAll(): Promise<PlacementImage[]> {
        if (this.dataPromise === undefined) {
            this.dataPromise = this.get<PlacementImage[]>(this.API_PATH)
        }

        return this.dataPromise
    }

    public async getByUuid(uuid: string): Promise<PlacementImage | undefined> {
        const all = await this.getAll()

        return all.find(image => image.uuid === uuid)
    }
}

export const placementImageRepository = new PlacementImageRepository()
