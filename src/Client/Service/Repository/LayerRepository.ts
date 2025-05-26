import { Events } from 'Client/Service/Events'
import { Repository } from 'Client/Service/Repository/Repository'
import { Layer } from 'Model/Layer'

class LayerRepository extends Repository {
    private readonly API_PATH = '/layers'

    private layers!: Layer[]

    private getLastOrder(): number {
        if (this.layers.length === 0) {
            return -1
        }
        return Math.max(...this.layers.map(item => item.order))
    }

    public async persist(...layers: Layer[]): Promise<void> {


        layers.forEach((layer) => {
            const lastOrder = this.getLastOrder()

            layer.order = lastOrder + 1

            this.layers.push(layer)
        })

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
        if (!this.layers) {
            this.layers = await this.get(this.API_PATH)
        }

        return this.layers.sort((a, b) => a.order - b.order)
    }

    public async remove(uuid: string): Promise<void> {
        await this.delete(this.API_PATH + '/' + uuid)
    }

    public setActive(uuid: string) {
        for (const layer of this.layers) {
            layer.is_active = layer.uuid === uuid
            Events.emit('layer-update', layer)
        }
    }

    public toggleVisible(uuid: string): void {
        for (const layer of this.layers) {
            if (layer.uuid === uuid) {
                layer.is_visible = !layer.is_visible
            }
            Events.emit('layer-update', layer)
        }
    }
}

export const layerRepository = new LayerRepository()