export class FileUpload {
    /** Resolves only when the server accepted every file. */
    public static async uploadMultiple(files: File[]): Promise<void> {
        const formData = new FormData()

        files.forEach((file) => {
            formData.append('files[]', file)
        })

        const response = await fetch('/upload-files', {
            method: 'POST',
            body: formData,
        })

        if (!response.ok) {
            const body: { error?: string } = await response.json().catch(() => ({}))

            throw new Error(body.error ?? `Upload failed with status ${response.status}`)
        }
    }
}
