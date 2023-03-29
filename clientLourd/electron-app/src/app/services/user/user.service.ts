import { Injectable } from "@angular/core";
import { User } from "@app/utils/interfaces/user";
import { BehaviorSubject } from "rxjs";
import { StorageService } from "../storage/storage.service";
import { Summary, UserStats } from "@app/utils/interfaces/summary";

@Injectable({
    providedIn: 'root',
})
export class UserService {
    subjectUser: BehaviorSubject<User>;
    constructor(private storageService: StorageService) {
        const userStats: UserStats = {
            nbGamesPlayed: 0,
            nbGamesWon: 0,
            averagePointsPerGame: 0,
            averageTimePlayed: 0
        }
        const summary: Summary = {
            networkLogs: [],
            gamesStats: [],
            userStats: userStats
        }
        this.subjectUser = new BehaviorSubject<User>({
            id: "0",
            username: "",
            email:"0@0.0",
            avatar:{url:"a", fileId:"a"},
            preferences:{theme:"light", language:"fr"},
            joinedChatRooms: [],
            joinedDMRooms: [],
            joinedGame: "",
            friends: [],
            pendingRequests: [],
            summary: summary
          });
    }

    public setUser(user: User): void {
        this.subjectUser.next(user);

    }

    public deleteUser(): void {
        const pref = this.subjectUser.value.preferences;
        const userStats: UserStats = {
            nbGamesPlayed: 0,
            nbGamesWon: 0,
            averagePointsPerGame: 0,
            averageTimePlayed: 0
        }
        const summary: Summary = {
            networkLogs: [],
            gamesStats: [],
            userStats: userStats
        }
        this.subjectUser.next({
            id: "0",
            username: "",
            email:"0@0.0",
            avatar:{url:"a", fileId:"a"},
            preferences: pref,
            joinedChatRooms: [],
            joinedDMRooms: [],
            joinedGame: "",
            friends: [],
            pendingRequests: [],
            summary: summary
        });
        this.storageService.deleteUserToken();
    }

    public get isLoggedIn(): boolean {
        return this.subjectUser.value.id != "0";
    }

    public get currentUserValue(): User {
        return this.subjectUser.value;
    }

    addFriendRequest(friendRequestId: string): void {
        this.subjectUser.next({...this.subjectUser.value, pendingRequests: [...this.subjectUser.value.pendingRequests, friendRequestId]});
    }
}