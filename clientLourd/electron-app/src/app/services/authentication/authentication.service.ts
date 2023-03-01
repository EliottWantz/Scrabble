import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http"
import { User } from "@app/utils/interfaces/user";
import { BehaviorSubject, Observable } from "rxjs";
import { CommunicationService } from "@app/services/communication/communication.service"
import { StorageService } from "../storage/storage.service";
import { environment } from "src/environments/environment";
import { WebsocketService } from "../web-socket/web-socket.service";

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    username: string = "";
    password: string = "";
    isLoggedIn = false;
    isLoginFailed = false;
    errorMessage = '';
    //subjectUser: BehaviorSubject<User>;
    constructor(private http: HttpClient, private commService: CommunicationService, private storageService: StorageService, private websocketService: WebsocketService) {
        //this.subjectUser = new BehaviorSubject();
    }
    
    ngOnInit(): void {
        if (this.storageService.isLoggedIn()) {
            this.isLoggedIn = true;
        }
    }

    async login(username: string, password: string): Promise<boolean> {
        return await this.commService.login(username, password).then((res) => {
            console.log(res);
            console.log("login");
            this.setSession(res);
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
            this.setSession(res);
            return true;
        })
        .catch((err) => {
            this.errorMessage = err.message;
            this.isLoginFailed = true;
            return false;
        });/*
        this.commService.register(username, password, email, avatar).subscribe({
            next: data => {
                console.log("register");
                this.storageService.saveUser(data.user);
                this.isLoginFailed = false;
                this.isLoggedIn = true;
            },
            error: err => {
                this.errorMessage = err.error.message;
                this.isLoginFailed = true;
            }
        });*/
    }

    private setSession(res: {user: User, token: string}): void {
        this.storageService
        this.storageService.saveUser(res.user);
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.websocketService.connect();
    }

    logout(): void {
        this.isLoggedIn = false;
        this.websocketService.disconnect();
        this.storageService.deleteUser();
    }
}