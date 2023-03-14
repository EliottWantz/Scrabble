import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class StorageService {
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