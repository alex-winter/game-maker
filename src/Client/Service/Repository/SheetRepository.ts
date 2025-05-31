import { Sheet } from 'Client/Model/Sheet'
import { Repository } from 'Client/Service/Repository/Repository'

class SheetRepository extends Repository {
    private readonly API_PATH = '/sheets'

    private data!: Sheet[]

    public async getAll(): Promise<Sheet[]> {
        if (!this.data) {
            this.data = await this.get(this.API_PATH)
        }
        return this.data
    }

    public getByName(name: string): Sheet {
        return this.data.find(sheet => sheet.name === name)!
    }
}

export const sheetRepository = new SheetRepository()