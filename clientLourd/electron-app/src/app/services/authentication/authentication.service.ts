import { Injectable } from "@angular/core";
import { User } from "@app/utils/interfaces/user";
import { CommunicationService } from "@app/services/communication/communication.service"
import { StorageService } from "../storage/storage.service";
import { UserService } from "@app/services/user/user.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    username: string = "";
    password: string = "";
    isLoginFailed = false;
    errorMessage = '';
    constructor(private commService: CommunicationService, private storageService: StorageService, private userService: UserService, private socketService: WebSocketService) {}

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

    async register(username: string, password: string, email: string, avatarURL: string, fileID: string): Promise<boolean> {
        return await this.commService.register(username, password, email, avatarURL, fileID).then((res) => {
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
            preferences: res.user.preferences
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