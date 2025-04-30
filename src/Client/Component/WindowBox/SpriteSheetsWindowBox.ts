import { Component } from "Client/Service/Component";
import { WindowBox } from "Client/Component/WindowBox/WindowBox";
import { Dom } from "Client/Service/Dom";

export class SpriteSheetsWindowBox extends Component
{
    protected build(): HTMLElement {
        const windowBox = Dom.component(WindowBox)
        const fileListing = document.createElement('file-listing')
        const fileUploader = document.createElement('file-uploader')
        const createNewButton = document.createElement('button')

        createNewButton.innerText = 'Create New'

        windowBox.dataset.title = 'Sprite Sheets'

        windowBox.append(
            fileListing,
            fileUploader,
            createNewButton,
        )

        return windowBox
    }
}