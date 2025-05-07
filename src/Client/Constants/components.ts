import { LayerListing } from 'Client/Component/LayerListing/LayerListing'
import { WindowBox } from 'Client/Component/WindowBox/WindowBox'
import { FileUploader } from 'Client/Component/File/FileUploader/FileUploader'
import { FileListing } from 'Client/Component/File/FileListing/FileListing'
import { SheetMaker } from 'Client/Component/SpriteSheets/SheetMaker/SheetMaker'
import { SideMenu } from 'Client/Component/SideMenu/SideMenu'
import { SheetImporter } from 'Client/Component/SpriteSheets/SheetImporter/SheetImporter'
import { BasicModal } from 'Client/Component/Generic/Modal/BasicModal'
import { NewLayerForm } from 'Client/Component/NewLayerForm/NewLayerForm'
import { CanvasLayer } from 'Client/Component/Canvas/CanvasLayer'

export const COMPONENTS = new Map<CustomElementConstructor, string>([

  [SideMenu, 'side-menu'],

  [LayerListing, 'layer-listing'],

  [WindowBox, 'window-box'],

  [FileUploader, 'file-uploader'],

  [FileListing, 'file-listing'],

  [SheetMaker, 'sheet-maker'],

  [SheetImporter, 'sheet-importer'],

  [BasicModal, 'modal-basic'],

  [NewLayerForm, 'new-layer-form'],

  [CanvasLayer, 'canvas-layer'],

])
