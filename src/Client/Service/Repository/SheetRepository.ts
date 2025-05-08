import { Sheet } from 'Client/Model/Sheet'
import { Repository } from 'Client/Service/Repository/Repository'

export class SheetRepository extends Repository {
    private readonly API_PATH = '/sheets'

    public async getAll(): Promise<Sheet[]> {
        return await this.get(this.API_PATH)
    }
}