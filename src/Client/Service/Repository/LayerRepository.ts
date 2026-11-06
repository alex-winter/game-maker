import { Events } from 'Client/Service/Events'
import { Repository } from 'Client/Service/Repository/Repository'
import { Id } from 'domain/id'
import { Layer } from 'Model/Layer'

export type LayerChangeKind = 'active' | 'visibility' | 'order' | 'name' | 'placements'

export type LayerChange = {
    readonly uuid: string

    readonly changed: LayerChangeKind
}

class LayerRepository extends Repository {
    private mapId: Id | undefined

    private layers: Layer[] | undefined

    /** Points every later call at one map's layers. Call before `getAll`. */
    public useMap(mapId: Id): void {
        if (this.mapId !== mapId) {
            this.layers = undefined
        }

        this.mapId = mapId
    }

    private get API_PATH(): string {
        if (this.mapId === undefined) {
            throw new Error('LayerRepository.useMap must be called before any layer request')
        }

        return `/maps/${this.mapId}/layers`
    }

    private get loaded(): Layer[] {
        if (this.layers === undefined) {
            throw new Error('Layers are not loaded; await getAll first')
        }

        return this.layers
    }

    private getLastOrder(): number {
        if (this.loaded.length === 0) {
            return -1
        }
        return Math.max(...this.loaded.map(item => item.order))
    }

    public async create(...layers: Layer[]): Promise<void> {
        for (const layer of layers) {
            const lastOrder = this.getLastOrder()

            layer.order = lastOrder + 1

            this.loaded.push(layer)
        }

        await this.post(
            this.API_PATH,
            layers,
        )

        Events.emit('layers-created', layers)
    }

    /** Copies `layer` over the stored one and persists that one layer. */
    public update(layer: Layer, changed: LayerChangeKind): Promise<void> {
        const found = this.loaded.find(l => l.uuid === layer.uuid)

        if (found && found !== layer) {
            Object.assign(
                found,
                layer,
            )
        }

        return this.persist(found ?? layer, changed)
    }

    public async getAll(): Promise<Layer[]> {
        if (this.layers === undefined) {
            this.layers = await this.get<Layer[]>(this.API_PATH)
        }

        return this.layers.sort((a, b) => a.order - b.order)
    }

    public async remove(uuid: string): Promise<void> {
        const index = this.loaded.findIndex(p => p.uuid === uuid)
        if (index !== -1) {
            this.loaded.splice(index, 1)
        }
        await this.delete(this.API_PATH + '/' + uuid)
    }

    public setActive(uuid: string): void {
        for (const layer of this.loaded) {
            const isActive = layer.uuid === uuid

            if (layer.is_active !== isActive) {
                layer.is_active = isActive
                this.persist(layer, 'active')
            }
        }
    }

    public toggleVisible(uuid: string): void {
        const layer = this.getByUuid(uuid)

        if (layer === undefined) {
            return
        }

        layer.is_visible = !layer.is_visible
        this.persist(layer, 'visibility')
    }

    public getByUuid(uuid: string): Layer | undefined {
        return this.loaded.find(layer => layer.uuid === uuid)
    }

    private async persist(layer: Layer, changed: LayerChangeKind): Promise<void> {
        const change: LayerChange = { uuid: layer.uuid, changed }

        Events.emit('layer-changed', change)

        await this.patch(
            this.API_PATH,
            layer,
        )
    }
}

export const layerRepository = new LayerRepository()
