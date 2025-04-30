import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'

export class FileListing extends Component {
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

        container.innerText = file.name

        return container
    }
}