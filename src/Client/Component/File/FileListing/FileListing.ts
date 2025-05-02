import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'

export class FileListing extends Component {
    protected css(): string {
        return /*css*/`
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

        Events.listenToFilesUploadSubmitted(fileList => {
            container.append(
                ...fileList.map(this.buildFile)
            )
        })

        return container
    }

    private buildFile(file: File): HTMLElement {
        const container = Dom.div('file')
        const name = Dom.div()
        const options = Dom.div()
        const openButton = Dom.button('Open')

        name.innerText = file.name

        options.append(openButton)

        container.append(name, options)

        return container
    }
}