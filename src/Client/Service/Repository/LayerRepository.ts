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

    public async create(...layers: Layer[]): Promise<void> {
        for (const layer of layers) {
            const lastOrder = this.getLastOrder()

            layer.order = lastOrder + 1

            this.layers.push(layer)
        }

        await this.post(
            this.API_PATH,
            layers,
        )

        Events.emit('layers-created', layers)
    }

    public update(layer: Layer): void {
        const found = this.layers.find(l => l.uuid === layer.uuid)

        if (found) {
            Object.assign(
                found,
                layer,
            )
        }

        this.patch(
            this.API_PATH,
            layer,
        )

        Events.emit('layers-update', undefined)
    }

    public async getAll(): Promise<Layer[]> {
        if (!this.layers) {
            this.layers = await this.get(this.API_PATH)
        }

        return this.layers.sort((a, b) => a.order - b.order)
    }

    public async remove(uuid: string): Promise<void> {
        const index = this.layers.findIndex(p => p.uuid === uuid)
        if (index !== -1) {
            this.layers.splice(index, 1)
        }
        await this.delete(this.API_PATH + '/' + uuid)
    }

    public setActive(uuid: string) {
        for (const layer of this.layers) {
            layer.is_active = layer.uuid === uuid
            this.update(layer)
        }
    }

    public toggleVisible(uuid: string): void {
        for (const layer of this.layers) {
            if (layer.uuid === uuid) {
                layer.is_visible = !layer.is_visible
            }
            this.update(layer)
        }
    }

    public getByUuid(uuid: string): Layer {
        return this.layers.find(layer => layer.uuid === uuid)!
    }
}

export const layerRepository = new LayerRepository()