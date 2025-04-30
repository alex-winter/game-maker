import { FileListing } from 'Client/Component/File/FileListing/FileListing'
import { FileUploader } from 'Client/Component/File/FileUploader/FileUploader'
import { SpriteMakerWindowBox } from 'Client/Component/WindowBox/SpriteMakerWindowBox'
import { WindowBox } from 'Client/Component/WindowBox/WindowBox'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'

export class SpriteSheetsWindowBox extends Component {
    protected build(): HTMLElement {
        const windowBox = Dom.component(WindowBox)
        const fileListing = Dom.component(FileListing)
        const fileUploader = Dom.component(FileUploader)
        const createNewButton = Dom.button('Create New')

        windowBox.dataset.title = 'Sprite Sheets'

        createNewButton.addEventListener('click', this.handleCreateNewClick.bind(this))

        windowBox.append(
            fileListing,
            fileUploader,
            createNewButton,
        )

        return windowBox
    }

    private handleCreateNewClick(): void {
        document.body.append(
            Dom.component(SpriteMakerWindowBox)
        )
    }
}