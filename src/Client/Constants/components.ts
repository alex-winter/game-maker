import { LayerListing } from 'Client/Component/LayerListing/LayerListing'
import { WindowBox } from 'Client/Component/WindowBox/WindowBox'
import { FileUploader } from 'Client/Component/File/FileUploader/FileUploader'
import { FileListing } from 'Client/Component/File/FileListing/FileListing'
import { SpriteSheetsWindowBox } from 'Client/Component/WindowBox/SpriteSheetsWindowBox'
import { SheetMaker } from 'Client/Component/SpriteSheets/SpriteMaker/SpriteMaker'
import { SideMenu } from 'Client/Component/SideMenu/SideMenu'
import { SpriteMakerWindowBox } from 'Client/Component/WindowBox/SpriteMakerWindowBox'

export const COMPONENTS = new Map<CustomElementConstructor, string>([

  [SideMenu, 'side-menu'],

  [LayerListing, 'layer-listing'],

  [WindowBox, 'window-box'],

  [FileUploader, 'file-uploader'],

  [FileListing, 'file-listing'],

  [SpriteSheetsWindowBox, 'sprite-sheets-window-box'],

  [SheetMaker, 'sprite-maker'],

  [SpriteMakerWindowBox, 'sprite-maker-window-box'],

])
