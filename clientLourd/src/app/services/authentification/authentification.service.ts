import { Injectable } from '@angular/core';
import { User } from '@common/user';
//import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
//import { environment } from 'src/environments/environment';
//import { map } from 'rxjs/operators';
import { CommunicationService } from '@app/services/communication-service/communication.service';
//import { first } from 'rxjs/operators';
import { StorageService } from '@app/services/storage/storage.service';
//import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class AuthentificationService {
    private currentUserSubject: BehaviorSubject<User>;
    private isConnected: Boolean;
    //private readonly baseUrl: string = environment.serverUrl;
    private user: User;

    constructor(/*private http: HttpClient, */private commService: CommunicationService) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser') || '{}'));
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
            console.log(user.user);
            this.isConnected = true;
            StorageService.setUserInfo(user.user);
            this.currentUserSubject = new BehaviorSubject(user.user);
            this.user = user.user;
        }, (error: Error) => {
            console.log(error);
        });
        console.log(this.currentUserSubject.value.id);
        this.commService.connect(this.currentUserSubject.value.id).then(() => {
            console.log('good');
        }).catch((error) => {
            console.log(error);
        });
    }

    logout() {
        console.log(this.user.id);
        return this.commService.logout(this.user.id).subscribe(() => {
            StorageService.removeUserInfo();
            this.currentUserSubject.next({
                id: "0",
                username: ""
            });
            this.isConnected = false;
            this.user = {id: "0", username: ""};
        }, (error: Error) => {
            console.log(error);
        });;
    }
}