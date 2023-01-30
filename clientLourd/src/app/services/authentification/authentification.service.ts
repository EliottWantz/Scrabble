import { Injectable } from '@angular/core';
import { CommunicationService } from '../communication-service/communication.service';
import { User } from '@common/user';
import { Observable, Subject } from 'rxjs';
import { HttpStatusCode } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class AuthentificationService {
    isConnected: Boolean;
    user: User;
    constructor(private communicationService: CommunicationService) {
        this.isConnected = false;
    }

    login(username: string, password: string): Boolean {
        let isGood: Boolean = false;
        this.communicationService.login(username, password).subscribe((res) => {
            if (res.status == HttpStatusCode.Ok && res.body) {
                this.user = res.body;
                isGood = true;
            }
            else if (res.status == HttpStatusCode.Ok) {
                isGood = true;
            }
        })
        return isGood;
    }
}