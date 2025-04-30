import { LayerListing } from 'Client/Component/LayerListing/LayerListing'
import { WindowBox } from 'Client/Component/WindowBox/WindowBox'
import { FileUploader } from 'Client/Component/File/FileUploader/FileUploader'
import { FileListing } from 'Client/Component/File/FileListing/FileListing'
import { SpriteSheetsWindowBox } from 'Client/Component/WindowBox/SpriteSheetsWindowBox'
import { SpriteMaker } from 'Client/Component/Canvas/SpriteMaker/SpriteMaker'
import { SideMenu } from 'Client/Component/SideMenu/SideMenu'

export const COMPONENTS = new Map<CustomElementConstructor, string>([
  
  [SideMenu, 'side-menu'],
  
  [LayerListing, 'layer-listing'],
  
  [WindowBox, 'window-box'],
  
  [FileUploader, 'file-uploader'],
  
  [FileListing, 'file-listing'],
  
  [SpriteSheetsWindowBox, 'sprite-sheets-window-box'],
  
  [SpriteMaker, 'sprite-maker'],
  
]);
