import { PlacementImage } from 'Model/Placement'
import { Repository } from 'Client/Service/Repository/Repository'

class PlacementImageRepository extends Repository {
    private readonly API_PATH: string = '/placement-images'
    private dataPromise: Promise<PlacementImage[]> | null = null
    private dataCache: PlacementImage[] = []

    public async persist(...placementImages: PlacementImage[]): Promise<void> {
        await this.getAll()

        this.dataCache.push(...placementImages)

        await this.post(this.API_PATH, placementImages)
    }

    public async getAll(): Promise<PlacementImage[]> {
        if (!this.dataPromise) {
            this.dataPromise = this.get(this.API_PATH).then(data => {
                this.dataCache = data as PlacementImage[]
                return data
            }) as Promise<PlacementImage[]>
        }

        return this.dataPromise
    }

    public async findOrCreateBySrc(src: string): Promise<PlacementImage> {
        const all = await this.getAll()

        const found = all.find(img => img.src === src)
        if (found) return found

        const placementImage: PlacementImage = {
            uuid: crypto.randomUUID(),
            src,
        }

        await this.persist(placementImage)

        return placementImage
    }

    public async getByUuid(uuid: string): Promise<PlacementImage | undefined> {
        const all = await this.getAll()
        return all.find(img => img.uuid === uuid)
    }
}


export const placementImageRepository = new PlacementImageRepository()