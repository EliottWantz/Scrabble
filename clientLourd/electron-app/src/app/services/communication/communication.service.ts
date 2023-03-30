import { HttpClient, HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from 'src/environments/environment';
import { User } from "@app/utils/interfaces/user";
import { catchError, lastValueFrom, Observable, throwError } from "rxjs";
import { Game } from "@app/utils/interfaces/game/game";

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    async login(username: string, password: string): Promise<{user: User, token: string}> {
        const res: any = (await lastValueFrom(this.requestLogin(username, password)));
        return res;
    }

    async register(data: FormData): Promise<{user: User, token: string}> {
        const res: any = (await lastValueFrom(this.requestRegister(data)));
        return res;
    }

    private requestLogin(username: string, password: string): Observable<{user: User}> {
        return this.http.post<{user: User}>(`${this.baseUrl}/login`, { username, password }).pipe(catchError(this.handleError));
    }

    private requestRegister(data: FormData): Observable<{user: User}> {
        return this.http.post<{user: User}>(`${this.baseUrl}/signup`, data).pipe(catchError(this.handleError));
    }

    async uploadAvatar(file: File, user: User): Promise<{url: string, fileId: string}> {
        const res: any = (await lastValueFrom(this.requestUploadAvatar(file, user)));
        return res;
    }

    private requestUploadAvatar(file: File, user: User): Observable<{url: string, fileId: string}> {
        /*return this.http.post<{URL: string, fileId: string}>(`${this.baseUrl}/avatar/${user.id}`, file, {
            headers: {"Authorization": `Bearer ${this.storageService.getUserToken()!}`}
        }).pipe(catchError(this.handleError));*/
        const formData = new FormData();
        formData.append("avatar", file);
        return this.http.post<{url: string, fileId: string}>(`${this.baseUrl}/avatar/${user.id}`, formData).pipe(catchError(this.handleError))
    }

    async getDefaultAvatars(): Promise<{avatars: [{url: string, fileId: string}]}> {
        const res: any = (await lastValueFrom(this.requestGetDefaultAvatars()));
        return res;
    }

    private requestGetDefaultAvatars(): Observable<{avatars: [{url: string, fileId: string}]}> {
        return this.http.get<{avatars: [{url: string, fileId: string}]}>(`${this.baseUrl}/avatar/defaults`).pipe(catchError(this.handleError));
    }

    async createGame(roomId: string): Promise<{game: Game}> {
        const res: any = (await lastValueFrom(this.requestCreateGame(roomId)));
        return res;
    }

    private requestCreateGame(roomId: string): Observable<{game: Game}> {
        return this.http.post<{game: Game}>(`${this.baseUrl}/game`, roomId).pipe(catchError(this.handleError));
    }

    private requestGetFriendsList(userId: string): Observable<{friends: [{friendId: string}]}>{
        return this.http.get<{friends: [{friendId: string}]}>(`${this.baseUrl}/user/friends/${userId}`).pipe(catchError(this.handleError));
    }

    private requestGetFriendByID(userId:string, friendId:string): Observable<{friend: User}> {
        return this.http.get<{friend: User}>(`${this.baseUrl}/user/friends/${userId}/${friendId}`).pipe(catchError(this.handleError));
    }

    async getFriendsList(userId: string): Promise<{friends: [{friendId: string}]}>{
        const res:any = (await lastValueFrom(this.requestGetFriendsList(userId)));
        return res;
    }

    async getFriendByID(userId:string, friendId:string): Promise<{friend: User}> {
        const res:any = (await lastValueFrom(this.requestGetFriendByID(userId, friendId)));
        return res;
    }


    async sendFriendRequest(id: string, friendId: string): Promise<string> {
        const res: any = (await lastValueFrom(this.requestSendFriendRequest(id, friendId)));
        return res;
    }

    private requestSendFriendRequest(id: string, friendId: string): Observable<string> {
        return this.http.post<string>(`${this.baseUrl}/user/friends/request/${id}/${friendId}`, { id, friendId }).pipe(catchError(this.handleError));
    }

    async acceptFriendRequest(id: string, friendId: string): Promise<string> {
        const res: any = (await lastValueFrom(this.requestAcceptFriendRequest(id, friendId)));
        return res;
    }

    private requestAcceptFriendRequest(id: string, friendId: string): Observable<string> {
        return this.http.patch<string>(`${this.baseUrl}/user/friends/accept/${id}/${friendId}`, { id, friendId }).pipe(catchError(this.handleError));
    }

    async declineFriendRequest(id: string, friendId: string): Promise<string> {
        const res: any = (await lastValueFrom(this.requestDeclineFriendRequest(id, friendId)));
        return res;
    }

    private requestDeclineFriendRequest(id: string, friendId: string): Observable<string> {
        return this.http.delete<string>(`${this.baseUrl}/user/friends/accept/${id}/${friendId}`).pipe(catchError(this.handleError));
    }

    async updateTheme(theme: string, language: string, id: string): Promise<void> {
        const res: any = (await lastValueFrom(this.requestUpdateTheme(theme, language, id)));
        return res;
    }

    public requestUpdateTheme(theme: string, language: string, id: string): Observable<void> {
        console.log("update theme");
        return this.http.patch<void>(`${this.baseUrl}/user/${id}/config`, {theme: theme, language: language}).pipe(catchError(this.handleError));
    }

    private handleError(error: HttpErrorResponse) {
        if (error.status === 0) {
          // A client-side or network error occurred. Handle it accordingly.
          console.error('An error occurred:', error.error);
        } else {
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong.
          console.error(
            `Backend returned code ${error.status}, body was: `, error.error);
        }
        // Return an observable with a user-facing error message.
        return throwError(() => new Error('Something bad happened; please try again later.'));
      }

}