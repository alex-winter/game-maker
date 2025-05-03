import { FileListing } from 'Client/Component/File/FileListing/FileListing'
import { FileUploader } from 'Client/Component/File/FileUploader/FileUploader'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'

export class SheetImporter extends Component {
    public isSingleton: boolean = true

    protected build(): HTMLElement {
        const container = Dom.div()
        const fileListing = Dom.makeComponent(FileListing)
        const uploader = Dom.makeComponent(FileUploader)

        container.append(
            fileListing,
            uploader,
        )

        return container
    }
}