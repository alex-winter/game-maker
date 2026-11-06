import { LoadedPlacement } from 'Client/Model/LoadedPlacement'
import { Dom } from 'Client/Service/Dom'
import { placementImageRepository } from 'Client/Service/Repository/PlacementImageRepository'
import { Layer } from 'Model/Layer'

/**
 * Decodes the placements of a legacy map so they can be drawn as a frozen
 * background. Nothing writes placements any more (T-020); a map painted
 * before metatiles stays visible but is not editable.
 */
export async function loadLegacyPlacements(layers: readonly Layer[]): Promise<LoadedPlacement[]> {
    const loaded: LoadedPlacement[] = []

    for (const layer of layers) {
        for (const placement of layer.placements) {
            const placementImage = await placementImageRepository.getByUuid(placement.imageUuid)

            if (placementImage === undefined) {
                continue
            }

            const image = await Dom.image(placementImage.src)

            loaded.push({
                uuid: placement.uuid,
                layerUuid: layer.uuid,
                image,
                x: placement.coordinate.x,
                y: placement.coordinate.y,
                width: image.width,
                height: image.height,
            })
        }
    }

    return loaded
}
