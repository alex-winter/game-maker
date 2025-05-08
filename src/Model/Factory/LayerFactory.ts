import { Layer } from 'Model/Layer'

export class LayerFactory {
    public static make(): Layer {
        return {
            uuid: crypto.randomUUID(),

            name: '',

            created_at: new Date().toISOString(),

            is_visible: true,

            placements: [],
        }
    }
}