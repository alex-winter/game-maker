import { EVENTS } from 'Client/Constants/events'

type EventFn<T = any> = (event: CustomEvent<T>) => void

export class Events {
    constructor() {
        throw new Error('Can not construct')
    }

    public static emit<T>(key: string, detail: T): void {
        document.dispatchEvent(
            new CustomEvent<T>(
                key,
                {
                    detail,
                    bubbles: true,
                    composed: true
                }
            )
        )
    }

    public static listen<T>(
        key: string,
        callback: EventFn<T>,
    ): void {
        document.addEventListener(key, callback as EventListener)
    }

    public static emitFilesUploadSubmitted(files: File[]): void {
        Events.emit<File[]>(
            EVENTS.uploadFilesSubmission,
            files
        )
    }

    public static listenToFilesUploadSubmitted(callback: (files: File[]) => void): void {
        Events.listen<File[]>(
            EVENTS.uploadFilesSubmission,
            event => {
                callback(event.detail)
            }
        )
    }

    public static emitOpenSheet(file: File | null = null): void {
        this.emit('open-sheet', file)
    }

    public static listenToOpenSheet(callback: (file: File | null) => void): void {
        Events.listen<File | null>(
            EVENTS.openSheet,
            event => {
                callback(event.detail)
            }
        )
    }
}
