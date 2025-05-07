interface HistoryRecord {
    datetime: Date

    layerUuid: string


}

export class LayerHistory {
    private readonly history: HistoryRecord[]

    undo() {

    }
}