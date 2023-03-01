import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from 'src/environments/environment';
import { User } from "@app/utils/interfaces/user";
import { catchError, Observable } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    login(username: string, password: string): Observable<{user: User}> {
        return this.http.post<{user: User}>(`${this.baseUrl}/login`, { username, password });
    }

    register(username: string, password: string, email: string, avatar: string): Observable<{user: User}> {
        return this.http.post<{user: User}>(`${this.baseUrl}/signup`, { username, password, email, avatar });
    }
}