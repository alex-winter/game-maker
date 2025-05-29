import { WindowBox } from 'Client/Component/WindowBox/WindowBox'
import { EVENTS } from 'Client/Constants/events'
import { Sheet } from 'Client/Model/Sheet'

type EventFn<T = any> = (event: CustomEvent<T>) => void

export class Events {
    constructor() {
        throw new Error('Can not construct')
    }

    public static emit<T>(key: string, detail: T | undefined = undefined): void {
        console.log('emit')
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

    private static addListener<T>(key: string, callback: EventFn<T>): void {
        document.addEventListener(
            key,
            callback as EventListener,
        )
    }

    public static listen<T>(
        callback: EventFn<T>,
        ...keys: string[]
    ): void {
        keys.forEach(key => {
            this.addListener(key, callback)
        })
    }

    public static emitFilesUploadSubmitted(files: File[]): void {
        Events.emit<File[]>(
            EVENTS.uploadFilesSubmission,
            files
        )
    }

    public static listenToFilesUploadSubmitted(callback: (files: File[]) => void): void {
        Events.listen<File[]>(
            event => {
                callback(event.detail)
            },
            EVENTS.uploadFilesSubmission,
        )
    }

    public static emitOpenSheet(sheet: Sheet): void {
        this.emit(EVENTS.openSheet, sheet)
    }

    public static listenToOpenSheet(callback: (sheet: Sheet) => void): void {
        Events.listen<Sheet>(
            event => {
                callback(event.detail)
            },
            EVENTS.openSheet,
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
            event => {
                callback(event.detail as WindowBox)
            },
            EVENTS.mouseDownWindowBox,
        )
    }

    public static emitSheetImportOpen(): void {
        Events.emit(
            EVENTS.openSheetImporter,
        )
    }

    public static listenToSheetImportOpen(callback: () => void): void {
        Events.listen(
            (event) => {
                callback()
            },
            EVENTS.openSheetImporter,
        )
    }
}
