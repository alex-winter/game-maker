import { Repository } from 'Client/Service/Repository/Repository'
import { UserData } from 'Model/UserData'

export class UserDataRepsitory extends Repository {
    private readonly API_PATH: string = '/user-data'

    public async persist(userData: UserData): Promise<void> {
        await this.patch(this.API_PATH, userData)
    }

    public async getAll(): Promise<UserData> {
        return await this.get(this.API_PATH)
    }
}