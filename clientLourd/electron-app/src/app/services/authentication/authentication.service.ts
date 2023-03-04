import { Injectable } from "@angular/core";
import { User } from "@app/utils/interfaces/user";
import { BehaviorSubject } from "rxjs";
import { CommunicationService } from "@app/services/communication/communication.service"
import { StorageService } from "../storage/storage.service";

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    username: string = "";
    password: string = "";
    isLoggedIn = false;
    isLoginFailed = false;
    errorMessage = '';
    subjectUser: BehaviorSubject<User>;
    constructor(private commService: CommunicationService, private storageService: StorageService) {
        this.subjectUser = new BehaviorSubject<User>({
            id: "0",
            username: "",
            email:"0@0.0",
            avatar:{url:"a",fileId:"a"},
            preferences:{theme:"a"},
          });
    }

    async login(username: string, password: string): Promise<boolean> {
        return await this.commService.login(username, password).then((res) => {
            console.log(res);
            console.log("login");
            this.setUser(res);
            return true;
        })
        .catch((err) => {
            this.errorMessage = err.message;
            this.isLoginFailed = true;
            return false;
        });
    }

    async register(username: string, password: string, email: string, avatar: string): Promise<boolean> {
        return await this.commService.register(username, password, email, avatar).then((res) => {
            console.log("register");
            this.setUser(res);
            return true;
        })
        .catch((err) => {
            this.errorMessage = err.message;
            this.isLoginFailed = true;
            return false;
        });
    }

    private setUser(res: {user: User, token: string}): void {
        this.subjectUser.value.username = res.user.username;
        this.subjectUser.value.email = res.user.email;
        this.subjectUser.value.avatar = res.user.avatar;
        this.subjectUser.value.id = res.user.id;
        this.subjectUser.value.preferences = res.user.preferences;
        this.storageService.saveUserToken(res.token);
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        //this.websocketService.connect();
    }

    logout(): void {
        this.isLoggedIn = false;
        //this.websocketService.disconnect();
    }

    public get currentUserValue(): User {
        return this.subjectUser.value;
      }
}