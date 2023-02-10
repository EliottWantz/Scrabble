import { Injectable } from "@angular/core";
import { User } from "@common/user";
//import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from "rxjs";
//import { environment } from 'src/environments/environment';
//import { map } from 'rxjs/operators';
import { CommunicationService } from "@app/services/communication-service/communication.service";
//import { first } from 'rxjs/operators';
import { StorageService } from "@app/services/storage/storage.service";
//import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: "root",
})
export class AuthentificationService {
  public currentUserSubject: BehaviorSubject<User>;
  public isConnected: Boolean;
  //private readonly baseUrl: string = environment.serverUrl;
  //private user: User;

  constructor(
    /*private http: HttpClient, */ private commService: CommunicationService
  ) {
    this.currentUserSubject = new BehaviorSubject<User>({
      id: "0",
      username: "",
    });
    this.isConnected = false;
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  public get getIsConnected(): Boolean {
    return this.isConnected;
  }

  login(username: string /*, password: string*/) {
    return this.commService.login(username);
  }

  logout() {
    // this.socketService.disconnect();
    return this.commService.logout(this.currentUserValue).subscribe(
      (res) => {
        console.log(res);
        StorageService.removeUserInfo();
        this.currentUserSubject.next({
          id: "0",
          username: "",
        });
        this.isConnected = false;
      },
      (error: Error) => {
        console.log(error);
      }
    );
  }
}
