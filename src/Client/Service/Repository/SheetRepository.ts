import { Sheet } from 'Client/Model/Sheet'
import { Repository } from 'Client/Service/Repository/Repository'

class SheetRepository extends Repository {
    private readonly API_PATH = '/sheets'

    private data: Sheet[] | undefined

    public async getAll(): Promise<Sheet[]> {
        if (this.data === undefined) {
            return this.refresh()
        }

        return this.data
    }

    /** Fetches the server's list again, for example after an upload. */
    public async refresh(): Promise<Sheet[]> {
        this.data = await this.get<Sheet[]>(this.API_PATH)

        return this.data
    }

    public getById(id: string): Sheet | undefined {
        return this.data?.find(sheet => sheet.id === id)
    }
}

export const sheetRepository = new SheetRepository()
