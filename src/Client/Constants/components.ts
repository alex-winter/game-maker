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
import { CanvasTools } from 'Client/Component/Canvas/CanvasTools'
import { SpriteEditor } from 'Client/Component/Sprite/SpriteEditor'
import { WorldEditor } from 'Client/Component/WorldEditor'
import { Ide } from 'Client/Component/Ide'
import { DialogEditor } from 'Client/Component/Dialog/DialogEditor'
import { FlagsEditor } from 'Client/Component/Flags/FlagsEditor'
import { ItemsEditor } from 'Client/Component/Items/ItemsEditor'
import { SpeciesEditor } from 'Client/Component/Creatures/SpeciesEditor'
import { ItemForm } from 'Client/Component/Events/ItemForm'
import { NpcForm } from 'Client/Component/Events/NpcForm'
import { SignForm } from 'Client/Component/Events/SignForm'
import { EventKindPicker } from 'Client/Component/Events/EventKindPicker'
import { MapSelect } from 'Client/Component/MapSelect/MapSelect'
import { ConfirmDialog } from 'Client/Component/MapSelect/ConfirmDialog'
import { MapSizeForm } from 'Client/Component/MapSelect/MapSizeForm'
import { MapConnectionsForm } from 'Client/Component/MapSelect/MapConnectionsForm'
import { WarpForm } from 'Client/Component/Events/WarpForm'
import { TilesetPalette } from 'Client/Component/Tileset/TilesetPalette'
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
  [CanvasTools, 'canvas-tools'],
  [SpriteEditor, 'sprite-editor'],
  [DialogEditor, 'dialog-editor'],
  [FlagsEditor, 'flags-editor'],
  [ItemsEditor, 'items-editor'],
  [SpeciesEditor, 'species-editor'],
  [ItemForm, 'item-form'],
  [NpcForm, 'npc-form'],
  [SignForm, 'sign-form'],
  [EventKindPicker, 'event-kind-picker'],
  [MapSelect, 'map-select'],
  [ConfirmDialog, 'confirm-dialog'],
  [MapSizeForm, 'map-size-form'],
  [MapConnectionsForm, 'map-connections-form'],
  [WarpForm, 'warp-form'],
  [TilesetPalette, 'tileset-palette'],
])

/** A stable id for a component kind, used to key saved window rectangles. The tag is already unique. */
export function componentId(component: ComponentConstructor): string {
  const tag = COMPONENTS.get(component)

  if (tag === undefined) {
    throw new Error(`Component not found in COMPONENTS map: ${component.name}`)
  }

  return tag
}