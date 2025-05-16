import { Repository } from 'Client/Service/Repository/Repository'
import { UserData } from 'Model/UserData'

export class UserDataRepsitory extends Repository {
    private readonly API_PATH: string = '/user-data'
    private data!: UserData

    public async persist(userData: UserData): Promise<void> {
        this.data = userData

        await this.patch(this.API_PATH, userData)
    }

    public async getAll(): Promise<UserData> {
        if (!this.data) {
            this.data = await this.get(this.API_PATH)
        }

        return this.data
    }
}