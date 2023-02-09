import { Injectable } from '@angular/core';
import { User } from '@common/user';
//import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
//import { environment } from 'src/environments/environment';
//import { map } from 'rxjs/operators';
import { CommunicationService } from '@app/services/communication-service/communication.service';
//import { first } from 'rxjs/operators';
import { StorageService } from '@app/services/storage/storage.service';
import { WebsocketService } from '../socket/websocket.service';
//import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class AuthentificationService {
    private currentUserSubject: BehaviorSubject<User>;
    private isConnected: Boolean;
    //private readonly baseUrl: string = environment.serverUrl;
    //private user: User;

    constructor(/*private http: HttpClient, */private commService: CommunicationService, private socketService: WebsocketService) {
        this.currentUserSubject = new BehaviorSubject<User>({id: "0", username: ""});
        this.isConnected = false;
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    public get getIsConnected(): Boolean {
        return this.isConnected;
    }

    login(username: string/*, password: string*/) {
        this.commService.login(username).subscribe(user => {
            if (user) {
                this.isConnected = true;
                this.currentUserSubject.next(user.user);
                StorageService.setUserInfo(user.user);

                this.commService.connect(this.currentUserValue.id).then(() => {
                    console.log('good');
                }).catch((error) => {
                    console.log(error);
                });
            }
        }, (error: Error) => {
            console.log(error);
        });
    }

    logout() {
        this.socketService.disconnect();
        return this.commService.logout(this.currentUserValue).subscribe(() => {
            StorageService.removeUserInfo();
            this.currentUserSubject.next({
                id: "0",
                username: ""
            });
            this.isConnected = false;
        }, (error: Error) => {
            console.log(error);
        });;
    }
}
