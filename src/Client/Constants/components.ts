import { LayerListing } from 'Client/Component/LayerListing/LayerListing'
import { WindowBox } from 'Client/Component/WindowBox/WindowBox'
import { FileUploader } from 'Client/Component/File/FileUploader/FileUploader'
import { FileListing } from 'Client/Component/SheetListing/SheetListing'
import { SheetViewer } from 'Client/Component/SpriteSheets/SheetViewer/SheetViewer'
import { SideMenu } from 'Client/Component/SideMenu/SideMenu'
import { SheetImporter } from 'Client/Component/SpriteSheets/SheetImporter/SheetImporter'
import { BasicModal } from 'Client/Component/Generic/Modal/BasicModal'
import { NewLayerForm } from 'Client/Component/NewLayerForm/NewLayerForm'
import { MapCanvas } from 'Client/Component/Canvas/MapCanvas'
import { LayerItem } from 'Client/Component/LayerListing/LayerItem'
import { Canvas2D } from 'Client/Component/Canvas/Canvas'
import { CanvasTools } from 'Client/Component/Canvas/CanvasTools'
import { PlacementHistory } from 'Client/Component/PlacementHistory/PlacementHistory'
import { AnimationMaker } from 'Client/Component/Animation/AnimationMaker'
import { WorldEditor } from 'Client/Component/WorldEditor'
import { Ide } from 'Client/Component/Ide'
import { DialogCreator } from 'Client/Component/Dialog/DialogCreator'
import { MapSelect } from 'Client/Component/MapSelect/MapSelect'
import { ComponentConstructor } from 'Client/Service/Dom'

export const COMPONENTS = new Map<ComponentConstructor, string>([
  [Ide, 'ide-wrapper'],
  [WorldEditor, 'world-editor'],
  [SideMenu, 'side-menu'],
  [LayerListing, 'layer-listing'],
  [WindowBox, 'window-box'],
  [FileUploader, 'file-uploader'],
  [FileListing, 'file-listing'],
  [SheetViewer, 'sheet-maker'],
  [SheetImporter, 'sheet-importer'],
  [BasicModal, 'modal-basic'],
  [NewLayerForm, 'new-layer-form'],
  [MapCanvas, 'map-canvas'],
  [LayerItem, 'layer-item'],
  [Canvas2D, 'canvas-2d'],
  [CanvasTools, 'canvas-tools'],
  [PlacementHistory, 'placement-history'],
  [AnimationMaker, 'animation-maker'],
  [DialogCreator, 'dialog-creator'],
  [MapSelect, 'map-select'],
])

/** A stable id for a component kind, used to key saved window rectangles. The tag is already unique. */
export function componentId(component: ComponentConstructor): string {
  const tag = COMPONENTS.get(component)

  if (tag === undefined) {
    throw new Error(`Component not found in COMPONENTS map: ${component.name}`)
  }

  return tag
}