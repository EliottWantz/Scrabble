import { Injectable } from "@angular/core";
import { User } from "@app/utils/interfaces/user";
import { CommunicationService } from "@app/services/communication/communication.service"
import { StorageService } from "../storage/storage.service";
import { UserService } from "@app/services/user/user.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    username = "";
    password = "";
    isLoginFailed = false;
    errorMessage = '';
    tempUserLogin: {username: string, password: string, email: string, avatar: BehaviorSubject<{url: string, fileId: string} | FormData>};
    constructor(private commService: CommunicationService, private storageService: StorageService, private userService: UserService, private socketService: WebSocketService) {
        this.tempUserLogin = {username: "", password: "", email: "", avatar: new BehaviorSubject<{url: string, fileId: string} | FormData>({url: "", fileId: ""})};
    }

    async login(username: string, password: string): Promise<boolean> {
        return await this.commService.login(username, password).then((res) => {
            this.setUser(res);
            this.socketService.connect();
            return true;
        })
        .catch((err) => {
            this.errorMessage = err.message;
            this.isLoginFailed = true;
            return false;
        });
    }

    async register(username: string, password: string, email: string, avatar: {url: string, fileId: string} | FormData): Promise<boolean> {
        return await this.commService.register(username, password, email, avatar).then((res) => {
            this.setUser(res);
            this.socketService.connect();
            return true;
        })
        .catch((err) => {
            this.errorMessage = err.message;
            this.isLoginFailed = true;
            return false;
        });
    }

    private setUser(res: {user: User, token: string}): void {
        this.userService.setUser({
            id: res.user.id,
            username: res.user.username,
            email: res.user.email,
            avatar: res.user.avatar,
            preferences: res.user.preferences,
            joinedChatRooms: res.user.joinedChatRooms,
            friends: res.user.friends,
            pendingRequests: res.user.pendingRequests,
            summary: res.user.summary
        });
        this.storageService.saveUserToken(res.token);
        this.isLoginFailed = false;
        //this.websocketService.connect();
    }

    logout(): void {
        this.userService.deleteUser();
        this.socketService.disconnect();
    }
}