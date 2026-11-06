import { Sheet } from 'Client/Model/Sheet'
import { Component, ExternalListeners, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { FileUpload } from 'Client/Service/FileUpload'
import { sheetRepository } from 'Client/Service/Repository/SheetRepository'

export class FileListing extends Component {
    protected externalListeners: ExternalListeners = {
        'upload-files-submission': this.handleFilesUploadSubmitted,
    }

    protected listeners: Listeners = {
        '.open-sheet-button:click': this.handleOpenSheetButtonClick
    }

    private sheets: Sheet[] = []
    private uploadError: string | undefined

    protected css(): string {
        return /*css*/`
            :host {
                display: block;
                max-height: 400px;
                overflow-y: scroll;
            }        

            .file {
                display: flex;
                padding: 10px;
            }
            .file div {
                flex: 1;
            }
            .upload-error {
                padding: 10px;
                color: #b00020;
            }
        `
    }

    protected async setup(): Promise<void> {
        this.sheets = await sheetRepository.getAll()
    }

    protected build(): HTMLElement {
        const container = Dom.div('container')

        if (this.uploadError !== undefined) {
            const error = Dom.div('upload-error')
            error.innerText = this.uploadError
            container.append(error)
        }

        container.append(
            ...this.sheets.map(this.buildSheet.bind(this))
        )

        return container
    }

    /** Uploads, then lists what the server has, so Open always finds a server copy. */
    private async handleFilesUploadSubmitted(files: File[]): Promise<void> {
        try {
            await FileUpload.uploadMultiple(files)
            this.uploadError = undefined
        } catch (error) {
            this.uploadError = error instanceof Error ? error.message : 'Upload failed'
        }

        this.sheets = await sheetRepository.refresh()
        this.patch()
    }

    private buildSheet(sheet: Sheet): HTMLElement {
        const container = Dom.div('file')
        const name = Dom.div()
        const options = Dom.div()
        const openButton = Dom.button('Open', 'open-sheet-button')

        name.innerText = sheet.name

        openButton.dataset.sheetId = sheet.id

        options.append(openButton)

        container.append(name, options)

        return container
    }

    private handleOpenSheetButtonClick(event: Event): void {
        const button = event.target as HTMLButtonElement
        const sheetId = button.dataset.sheetId

        if (sheetId !== undefined) {
            Events.emit('open-sheet', sheetId)
        }
    }
}
