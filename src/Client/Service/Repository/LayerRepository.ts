import { Repository } from 'Client/Service/Repository/Repository'
import { Layer } from 'Model/Layer'

export class LayerRepository extends Repository {
    private static readonly API_PATH = '/layers'

    public static async persist(...layers: Layer[]): Promise<void> {
        await this.post(
            this.API_PATH,
            layers,
        )
    }

    public static async getAll(): Promise<Layer[]> {
        return await this.get(this.API_PATH)
    }
}