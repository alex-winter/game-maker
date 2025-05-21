import { UserData } from 'Model/UserData'

export class UserDataFactory {
    public static make(): UserData {
        return {
            lastViewPosition: {
                x: 0,
                y: 0,
            },

            windows: {},
        }
    }
}