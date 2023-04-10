import { HttpClient, HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from 'src/environments/environment';
import { User } from "@app/utils/interfaces/user";
import { catchError, firstValueFrom, lastValueFrom, Observable, of, throwError } from "rxjs";
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

    private requestLogin(username: string, password: string): Observable<{user: User, token: string}> {
        return this.http.post<{user: User, token: string}>(`${this.baseUrl}/login`, { username, password }).pipe(catchError(this.handleError<{user: User, token: string}>("login")));
    }

    private requestRegister(data: FormData): Observable<{user: User}> {
        return this.http.post<{user: User}>(`${this.baseUrl}/signup`, data).pipe(catchError(this.handleError<{user: User}>("register")));
    }

    async uploadAvatar(file: File, user: User): Promise<{url: string, fileId: string}> {
        const res: any = (await lastValueFrom(this.requestUploadAvatar(file, user)));
        return res;
    }

    private requestUploadAvatar(file: File, user: User): Observable<{url: string, fileId: string}> {
        const formData = new FormData();
        formData.append("avatar", file);
        return this.http.post<{url: string, fileId: string}>(`${this.baseUrl}/avatar/${user.id}`, formData).pipe(catchError(this.handleError<{url: string, fileId: string}>("uploadAvatar")));
    }

    async getDefaultAvatars(): Promise<{avatars: [{url: string, fileId: string}]}> {
        const res: any = (await lastValueFrom(this.requestGetDefaultAvatars()));
        return res;
    }

    private requestGetDefaultAvatars(): Observable<{avatars: [{url: string, fileId: string}]}> {
        return this.http.get<{avatars: [{url: string, fileId: string}]}>(`${this.baseUrl}/avatar/defaults`).pipe(catchError(this.handleError<{avatars: [{url: string, fileId: string}]}>("getDefaultAvatars")));
    }

    async createGame(roomId: string): Promise<{game: Game}> {
        const res: any = (await lastValueFrom(this.requestCreateGame(roomId)));
        return res;
    }

    private requestCreateGame(roomId: string): Observable<{game: Game}> {
        return this.http.post<{game: Game}>(`${this.baseUrl}/game`, roomId).pipe(catchError(this.handleError<{game: Game}>("createGame")));
    }

    private requestGetFriendsList(userId: string): Observable<{friends: [{friendId: string}]}>{
        return this.http.get<{friends: [{friendId: string}]}>(`${this.baseUrl}/user/friends/${userId}`).pipe(catchError(this.handleError<{friends: [{friendId: string}]}>('requestGetFriendsList')));
    }

    private requestGetFriendByID(userId:string, friendId:string): Observable<{friend: User}> {
        return this.http.get<{friend: User}>(`${this.baseUrl}/user/friends/${userId}/${friendId}`).pipe(catchError(this.handleError<{friend: User}>('requestGetFriendByID')));
    }

    async getFriendsList(userId: string): Promise<{friends: [{friendId: string}]}>{
        const res:any = (await lastValueFrom(this.requestGetFriendsList(userId)));
        return res;
    }

    async getFriendByID(userId:string, friendId:string): Promise<{friend: User}> {
        const res:any = (await lastValueFrom(this.requestGetFriendByID(userId, friendId)));
        return res;
    }

    requestSendFriendRequest(id: string, friendId: string): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/user/friends/request/${id}/${friendId}`, { id, friendId }).pipe(catchError(this.handleError<void>("sendFriendRequest")));
    }

    requestAcceptFriendRequest(id: string, friendId: string): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/user/friends/accept/${id}/${friendId}`, { id, friendId }).pipe(catchError(this.handleError<void>("acceptFriendRequest")));
    }


    requestDeclineFriendRequest(id: string, friendId: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/user/friends/accept/${id}/${friendId}`).pipe(catchError(this.handleError<void>("declineFriendRequest")));
    }

    requestUpdateTheme(theme: string, language: string, id: string): Observable<void> {
        console.log("update theme");
        return this.http.patch<void>(`${this.baseUrl}/user/${id}/config`, {theme: theme, language: language}).pipe(catchError(this.handleError<void>("updateTheme")));
    }

    getCustomAvatar(gender: string, skinColor: string, hairType: string, hairColor: string, accessories: string, eyebrows: string, facialHair: string, eyes: string, facialHairColor: string, mouth: string, backgroundColor: string): Observable<any> {
        if (facialHair == "none" && accessories == "none") {
            return this.http.get<any>(`https://api.dicebear.com/6.x/avataaars/png?seed=${gender == "Male" ? "Baby" : "Annie"}&skinColor=${skinColor.substring(1)}&top=${hairType}&mouth=${mouth}&hairColor=${hairColor.substring(1)}&eyes=${eyes}&eyebrows=${eyebrows}&facialHairProbability=0&facialHairColor=${facialHairColor.substring(1)}&backgroundColor=${backgroundColor.substring(1)}&accessoriesProbability=0`);
        } else if (facialHair == "none") {
            return this.http.get<any>(`https://api.dicebear.com/6.x/avataaars/png?seed=${gender == "Male" ? "Baby" : "Annie"}&skinColor=${skinColor.substring(1)}&top=${hairType}&mouth=${mouth}&hairColor=${hairColor.substring(1)}&eyes=${eyes}&eyebrows=${eyebrows}&facialHairProbability=0&facialHairColor=${facialHairColor.substring(1)}&backgroundColor=${backgroundColor.substring(1)}&accessories=${accessories}&accessoriesProbability=100`);
        } else if (accessories == "none") {
            return this.http.get<any>(`https://api.dicebear.com/6.x/avataaars/png?seed=${gender == "Male" ? "Baby" : "Annie"}&skinColor=${skinColor.substring(1)}&top=${hairType}&mouth=${mouth}&hairColor=${hairColor.substring(1)}&eyes=${eyes}&eyebrows=${eyebrows}&facialHair=${facialHair}&facialHairProbability=100&facialHairColor=${facialHairColor.substring(1)}&backgroundColor=${backgroundColor.substring(1)}&accessoriesProbability=0`);
        } else {
            return this.http.get<any>(`https://api.dicebear.com/6.x/avataaars/png?seed=${gender == "Male" ? "Baby" : "Annie"}&skinColor=${skinColor.substring(1)}&top=${hairType}&mouth=${mouth}&hairColor=${hairColor.substring(1)}&eyes=${eyes}&eyebrows=${eyebrows}&facialHair=${facialHair}&facialHairProbability=100&facialHairColor=${facialHairColor.substring(1)}&backgroundColor=${backgroundColor.substring(1)}&accessories=${accessories}&accessoriesProbability=100`);
        }
    }

    public acceptPlayer(userId: string, requestorId: string, gameId: string): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/game/accept/${userId}/${requestorId}/${gameId}`, {});
    }

    public denyPlayer(userId: string, requestorId: string, gameId: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/game/accept/${requestorId}/${userId}/${gameId}`);
    }

  public revokeJoinGame(userId: string, gameId: string): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/game/revoke/${userId}/${gameId}`,
      {}
    );
  }

  public getOnlineFriends(userId: string): Observable<{ friends: User[] }> {
    return this.http.get<{ friends: User[] }>(`${this.baseUrl}/user/friends/online/${userId}`).pipe(catchError(this.handleError<{ friends: User[] }>("getOnlineFriends")));
  }

  private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
    return (err: Error) => {
        if (err instanceof HttpErrorResponse && err.status === 200) {
           console.log('200');
        }
        if (err instanceof HttpErrorResponse && err.statusText === 'Unknown Error') {
            console.log('Unknown Error');
        }
        return of(result as T);
    };
}

}