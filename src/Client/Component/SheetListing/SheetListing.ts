import { EVENTS } from 'Client/Constants/events'
import { Sheet } from 'Client/Model/Sheet'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'

export class FileListing extends Component {
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

    protected build(): HTMLElement {
        const container = Dom.div()

        Events.listenToFilesUploadSubmitted(async fileList => {
            const sheets = await Promise.all(
                fileList.map(this.mapToSheet.bind(this))
            )
            container.append(
                ...sheets.map(this.buildSheet.bind(this))
            )
        })

        Events.listen(
            event => {
                container.append(
                    ...(event.detail as Sheet[])
                        .map(this.buildSheet.bind(this))
                )
            },
            EVENTS.gotSheets,
        )

        Events.emit(EVENTS.getSheets)

        return container
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
        const openButton = Dom.button('Open')

        name.innerText = sheet.name

        openButton.addEventListener('click', (e) => Events.emitOpenSheet(sheet))

        options.append(openButton)

        container.append(name, options)

        return container
    }
}