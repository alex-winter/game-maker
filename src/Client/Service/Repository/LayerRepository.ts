import { Events } from 'Client/Service/Events'
import { Repository } from 'Client/Service/Repository/Repository'
import { Layer } from 'Model/Layer'

export class LayerRepository extends Repository {
    private readonly API_PATH = '/layers'

    private layers!: Layer[]

    public async persist(...layers: Layer[]): Promise<void> {
        await this.post(
            this.API_PATH,
            layers,
        )
    }

    public async update(layer: Layer): Promise<void> {
        const found = this.layers.find(l => l.uuid === layer.uuid)

        if (found) {
            Object.assign(
                found,
                layer,
            )
        }

        await this.patch(
            this.API_PATH,
            layer,
        )
    }

    public async getAll(): Promise<Layer[]> {
        if (this.layers) {
            return this.layers
        }

        return this.layers = await this.get(this.API_PATH)
    }

    public setActive(uuid: string) {
        for (const layer of this.layers) {
            layer.is_active = layer.uuid === uuid
            Events.emit('layer-update', layer)
        }
    }
}