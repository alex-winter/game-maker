/** One row of `uploads/index.json`: the display name of a file stored under a generated name. */
export type UploadedSheet = {
    readonly id: string

    readonly originalName: string

    readonly file: string
}
