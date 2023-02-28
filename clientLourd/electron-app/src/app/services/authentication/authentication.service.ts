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

    async login(username: string, password: string): Promise<void> {
        await this.commService.login(username, password).then(data => {
            data.subscribe({
                next: info => {
                    if (info != null) {
                        this.storageService.saveUser(info.user);
                        this.isLoginFailed = false;
                        this.isLoggedIn = true;
                    } else {
                        this.isLoginFailed = true;
                    }
                },
                error: err => {
                    this.errorMessage = err.error.message;
                    this.isLoginFailed = true;
                }
            })
        });
        if (this.isLoggedIn) {
            this.websocketService.connect();
        }
        /*
        .subscribe({
            next: data => {
                if (data != null) {
                    this.storageService.saveUser(data.user);
                    this.isLoginFailed = false;
                    this.isLoggedIn = true;
                    return true;
                } else {
                    this.isLoginFailed = true;
                }
                
            },
            error: err => {
                this.errorMessage = err.error.message;
                this.isLoginFailed = true;
            }
        });*/
    }

    logout(): void {
        this.isLoggedIn = false;
        this.websocketService.disconnect();
        this.storageService.deleteUser();
    }
}