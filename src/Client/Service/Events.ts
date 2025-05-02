import { WindowBox } from 'Client/Component/WindowBox/WindowBox'
import { EVENTS } from 'Client/Constants/events'

type EventFn<T = any> = (event: CustomEvent<T>) => void

export class Events {
    constructor() {
        throw new Error('Can not construct')
    }

    public static emit<T>(key: string, detail: T | undefined = undefined): void {
        document.dispatchEvent(
            new CustomEvent<T>(
                key,
                {
                    detail,
                    bubbles: false,
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

    public static emitMouseDownOnWindowBox(windowBox: WindowBox): void {
        Events.emit(
            EVENTS.mouseDownWindowBox,
            windowBox,
        )
    }

    public static listenMouseDownOnWindowBox(callback: (windowBox: WindowBox) => void): void {
        Events.listen<HTMLElement>(
            EVENTS.mouseDownWindowBox,
            event => {
                callback(event.detail as WindowBox)
            }
        )
    }

    public static emitSheetImportOpen(): void {
        Events.emit(
            EVENTS.openSheetImporter,
        )
    }

    public static listenToSheetImportOpen(callback: () => void): void {
        Events.listen(
            EVENTS.openSheetImporter,
            (event) => {
                callback()
            }
        )
    }
}
