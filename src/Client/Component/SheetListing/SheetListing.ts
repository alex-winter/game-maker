import { Sheet } from 'Client/Model/Sheet'
import { Component, ExternalListeners, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { sheetRepository } from 'Client/Service/Repository/SheetRepository'

export class FileListing extends Component {
    protected externalListeners: ExternalListeners = {
        'upload-files-submission': this.handleFilesUploadSubmitted
    }

    protected listeners: Listeners = {
        '.open-sheet-button:click': this.handleOpenSheetButtonClick
    }

    private sheets!: Sheet[]

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
        `
    }

    protected async setup(): Promise<void> {
        this.sheets = await sheetRepository.getAll()
    }

    protected build(): HTMLElement {
        const container = Dom.div('container')

        container.append(
            ...this.sheets.map(this.buildSheet.bind(this))
        )

        return container
    }

    private getContainer(): HTMLDivElement {
        return this.findOne('.container')!
    }

    private handleFilesUploadSubmitted(event: CustomEvent): void {
        const files = event.detail as File[]

        Promise.all(
            files.map(this.mapToSheet.bind(this))
        ).then(sheets => {
            this.getContainer().append(
                ...sheets.map(this.buildSheet.bind(this))
            )
        })
    }

    private mapToSheet(file: File): Promise<Sheet> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            reader.onload = () => {
                const base64 = reader.result as string
                resolve({
                    name: file.name,
                    imageSrc: base64,
                })
            }

            reader.onerror = () => {
                reject(new Error('Failed to read file'))
            }

            reader.readAsDataURL(file)
        })
    }

    private buildSheet(sheet: Sheet): HTMLElement {
        const container = Dom.div('file')
        const name = Dom.div()
        const options = Dom.div()
        const openButton = Dom.button('Open', 'open-sheet-button')

        name.innerText = sheet.name

        openButton.dataset.sheetName = sheet.name

        options.append(openButton)

        container.append(name, options)

        return container
    }

    private handleOpenSheetButtonClick(event: Event): void {
        const button = event.target as HTMLButtonElement
        Events.emit('open-sheet', button.dataset.sheetName as string)
    }
}