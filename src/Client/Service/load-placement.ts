import { Dom } from 'Client/Service/Dom'
import { loadedPlacementRepository } from 'Client/Service/Repository/LoadedPlacement'
import { placementImageRepository } from 'Client/Service/Repository/PlacementImageRepository'
import { ImagePlacement } from 'Model/Placement'

export function loadPlacement(
    placement: ImagePlacement,
    layerUuid: string,
): void {
    placementImageRepository.getByUuid(placement.imageUuid)
        .then(image => {
            if (image) {
                Dom.image(image.src).then(htmlImage => {
                    loadedPlacementRepository.add({
                        uuid: placement.uuid,
                        layerUuid,
                        image: htmlImage,
                        x: placement.coordinate.x,
                        y: placement.coordinate.y,
                        width: htmlImage.width,
                        height: htmlImage.height,
                    })
                })
            }
        })
}