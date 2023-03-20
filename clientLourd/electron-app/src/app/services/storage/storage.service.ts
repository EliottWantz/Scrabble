import { Injectable } from '@angular/core';
import { User } from '@app/utils/interfaces/user';

@Injectable({
    providedIn: 'root',
})
export class StorageService {
    listUsers: User[] = [];

    getUserFromName(username: string): User | undefined {
        for (const user of this.listUsers) {
            if (user.username == username)
                return user;
        }
        return undefined;
    }


    clean(): void {
        sessionStorage.clear();
    }

    public saveUserToken(token: string): void {
        sessionStorage.setItem('id_token', token);
    }

    public getUserToken(): string | null {
        const token = sessionStorage.getItem('id_token');
        if (token)
            return token;
        return null;
    }

    public deleteUserToken(): void {
        const token = sessionStorage.getItem('id_token');
        if (token)
            sessionStorage.removeItem('id_token');
    }
}