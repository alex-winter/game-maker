import { Component } from "Client/Service/Component";

export class SpriteSheetsWindowBox extends Component
{
    protected build(): HTMLElement {
        const windowBox = document.createElement('window-box')
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