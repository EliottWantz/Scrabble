import { Injectable } from "@angular/core";
import { User } from "@app/utils/interfaces/user";
import { BehaviorSubject } from "rxjs";
import { CommunicationService } from "@app/services/communication/communication.service"
import { StorageService } from "../storage/storage.service";

@Injectable({
    providedIn: 'root',
})
export class UserService {
    subjectUser: BehaviorSubject<User>;
    constructor() {
        this.subjectUser = new BehaviorSubject<User>({
            id: "0",
            username: "",
            email:"0@0.0",
            avatar:{url:"a",fileId:"a"},
            preferences:{theme:"a"},
          });
    }

    public setUser(user: User): void {
        this.subjectUser.next(user);

    }

    public deleteUser(): void {
        this.subjectUser.next({
            id: "0",
            username: "",
            email:"0@0.0",
            avatar:{url:"a",fileId:"a"},
            preferences:{theme:"a"},
        });
    }

    public get isLoggedIn(): boolean {
        return this.subjectUser.value.id != "0";
    }

    public get currentUserValue(): User {
        return this.subjectUser.value;
    }
}