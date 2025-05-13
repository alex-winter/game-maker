import { PlacementImage } from 'Client/Model/Placement'
import { Repository } from 'Client/Service/Repository/Repository'

class PlacementImageRepository extends Repository {
    private readonly API_PATH: string = '/placement-images'
    private data: PlacementImage[] = []

    public async persist(...placementImage: PlacementImage[]): Promise<void> {
        this.data.push(...placementImage)

        await this.post(this.API_PATH, placementImage)
    }

    public async getAll(): Promise<PlacementImage[]> {
        if (this.data === undefined) {
            this.data = await this.get(this.API_PATH)
        }

        return this.data
    }

    public findOrCreateBySrc(src: string): PlacementImage {
        const found = this.data.find(placementImage => placementImage.src === src)

        if (found) {
            return found
        }

        const placementImage = {
            src,
        }

        this.persist(placementImage)

        return placementImage
    }
}

export const placementImageRepository = new PlacementImageRepository()