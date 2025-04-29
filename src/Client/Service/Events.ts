import { EVENTS } from "Client/Constants/events"

type EventFn = (event: Event) => void

export class Events {
    constructor () {
        throw new Error('Can not construct')
    }

    public static emit(key: string, detail: any): void {
        document.dispatchEvent(
            new CustomEvent(
                key,
                {
                    detail,
                    bubbles: true,
                    composed: true,
                }
            )
        )
    }

    public static listen(
        key: string, 
        callback: EventFn,
    ): void {
        document.addEventListener(key, callback)
    }

    public static emitFilesUploadSubmitted(files: FileList): void 
    {
        Events.emit(
            EVENTS.uploadFilesSubmission,
            files,
        )
    }

    public static listenToFilesUploadSubmitted(callback: EventFn): void 
    {
        Events.listen(
            EVENTS.uploadFilesSubmission,
            callback,
        )
    }
}