import { Repository } from 'Client/Service/Repository/Repository'
import { Layer } from 'Model/Layer'

export class LayerRepository extends Repository {
    private readonly API_PATH = '/layers'

    public async persist(...layers: Layer[]): Promise<void> {
        await this.post(
            this.API_PATH,
            layers,
        )
    }

    public async update(layer: Layer): Promise<void> {
        await this.patch(
            this.API_PATH,
            layer,
        )
    }

    public async getAll(): Promise<Layer[]> {
        return await this.get(this.API_PATH)
    }
}