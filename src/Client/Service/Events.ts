export type EventCallback<T> = (payload: T) => void

type AnyCallback = EventCallback<never>

/**
 * The global string bus. Use it for things that genuinely have many
 * listeners (tool changed, layer changed); prefer a direct call otherwise.
 */
export class Events {
    public static openAddNewLayer = 'open-add-new-layer'
    public static openAddPlayer = 'open-add-player'

    private static listeners = new Map<string, AnyCallback[]>()

    public static emit<T>(key: string, payload: T): void {
        const callbacks = this.listeners.get(key)

        if (callbacks === undefined) {
            return
        }

        // Copy so a listener that unlistens during emit does not skip its neighbour.
        for (const callback of [...callbacks]) {
            (callback as EventCallback<T>)(payload)
        }
    }

    public static listen<T>(key: string, callback: EventCallback<T>): void {
        const callbacks = this.listeners.get(key) ?? []

        callbacks.push(callback as AnyCallback)
        this.listeners.set(key, callbacks)
    }

    public static unlisten<T>(key: string, callback: EventCallback<T>): void {
        const callbacks = this.listeners.get(key)

        if (callbacks === undefined) {
            return
        }

        this.listeners.set(key, callbacks.filter(existing => existing !== callback))
    }
}
