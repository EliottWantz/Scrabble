import { Injectable } from '@angular/core';
import { User } from '@app/utils/interfaces/user';

const USER_KEY = 'auth-user';

@Injectable({
    providedIn: 'root',
})
export class StorageService {
    constructor() {}

    clean(): void {
        sessionStorage.clear();
    }

    public saveUser(user: User): void {
        sessionStorage.removeItem(USER_KEY);
        sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    public getUser(): User | null {
        const user = sessionStorage.getItem(USER_KEY);
        if (user)
            return JSON.parse(user);
        return null;
    }

    public deleteUser(): void {
        const user = sessionStorage.getItem(USER_KEY);
        if (user)
            sessionStorage.removeItem(USER_KEY);
    }

    public isLoggedIn(): boolean {
        const user = sessionStorage.getItem(USER_KEY);
        if (user)
            return true;
        
        return false;
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