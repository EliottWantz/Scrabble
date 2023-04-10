import { Injectable } from '@angular/core';
import { Game } from '@app/utils/interfaces/game/game';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InviteService {
    invites: BehaviorSubject<{game: Game, inviterId: string}[]>;
    constructor() {
        this.invites = new BehaviorSubject<{game: Game, inviterId: string}[]>([]);
    }

    createInvite(inviterId: string, game: Game): void {
        const newInvite = {inviterId: inviterId, game: game};
        this.invites.next([...this.invites.value, newInvite]);
        setTimeout(() => {
            const newInvites = this.invites.value;
            const index = newInvites.indexOf(newInvite);
            if (index > -1) {
                newInvites.splice(index, 1);
            }
            this.invites.next(newInvites);
        }, 10000);
    }
}