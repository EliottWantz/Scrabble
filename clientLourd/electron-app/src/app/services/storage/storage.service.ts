import { Injectable } from '@angular/core';
import { User } from '@app/utils/interfaces/user';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class StorageService {
    listUsers: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
    avatars: BehaviorSubject<Map<string, string>> = new BehaviorSubject<Map<string, string>>(new Map<string, string>());

    addAvatar(id: string, url: string): void {
        const map = this.avatars.value;
        map.set(id, url);
        this.avatars.next(map);
    }

    getAvatar(id: string): string | undefined {
        const map = this.avatars.value;
        return map.get(id);
    }

    getUserFromName(username: string): User | undefined {
        for (const user of this.listUsers.value) {
            if (user.username == username)
                return user;
        }
        return undefined;
    }

    getUserFromId(id: string): User | undefined {
        for (const user of this.listUsers.value) {
            if (user.id == id)
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