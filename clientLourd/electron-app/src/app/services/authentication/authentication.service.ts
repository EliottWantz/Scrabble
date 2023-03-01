import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http"
import { User } from "@app/utils/interfaces/user";
import { Observable } from "rxjs";
import { CommunicationService } from "@app/services/communication/communication.service"
import { StorageService } from "../storage/storage.service";
import { environment } from "src/environments/environment";
import { WebsocketService } from "../web-socket/web-socket.service";

//TODO: Logout, Web-socket service, login component, register component https://www.bezkoder.com/angular-14-jwt-auth/#Login_Component

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    username: string = "";
    password: string = "";
    isLoggedIn = false;
    isLoginFailed = false;
    errorMessage = '';
    constructor(private http: HttpClient, private commService: CommunicationService, private storageService: StorageService, private websocketService: WebsocketService) {
    }
    
    ngOnInit(): void {
        if (this.storageService.isLoggedIn()) {
            this.isLoggedIn = true;
        }
    }

    login(username: string, password: string): void {
        this.commService.login(username, password).subscribe({
            next: data => {
                console.log("login");
                this.storageService.saveUser(data.user);
                this.isLoginFailed = false;
                this.isLoggedIn = true;
            },
            error: err => {
                this.errorMessage = err.error.message;
                this.isLoginFailed = true;
            }
        });
        if (this.isLoggedIn) {
            this.websocketService.connect();
        }
    }

    register(username: string, password: string, email: string, avatar: string): void {
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
        });
        if (this.isLoggedIn) {
            this.websocketService.connect();
        }
    }

    logout(): void {
        this.isLoggedIn = false;
        this.websocketService.disconnect();
        this.storageService.deleteUser();
    }
}