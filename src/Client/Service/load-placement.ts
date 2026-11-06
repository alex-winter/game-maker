import { Dom } from 'Client/Service/Dom'
import { loadedPlacementRepository } from 'Client/Service/Repository/LoadedPlacement'
import { placementImageRepository } from 'Client/Service/Repository/PlacementImageRepository'
import { ImagePlacement } from 'Model/Placement'

export async function loadPlacement(
    placement: ImagePlacement,
    layerUuid: string,
): Promise<void> {
    const image = await placementImageRepository.getByUuid(placement.imageUuid)

    if (!image) {
        return
    }

    const htmlImage = await Dom.image(image.src)

    loadedPlacementRepository.add({
        uuid: placement.uuid,
        layerUuid,
        image: htmlImage,
        x: placement.coordinate.x,
        y: placement.coordinate.y,
        width: htmlImage.width,
        height: htmlImage.height,
    })
}
