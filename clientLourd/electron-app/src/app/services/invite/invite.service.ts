import { Injectable } from '@angular/core';
import { Game } from '@app/utils/interfaces/game/game';
import { BehaviorSubject } from 'rxjs';
import { GameService } from '@app/services/game/game.service';

@Injectable({
  providedIn: 'root',
})
export class InviteService {
    invites: BehaviorSubject<{game: Game, inviterId: string, error: string, password: string | undefined}[]>;
    constructor(private gameService: GameService) {
        this.invites = new BehaviorSubject<{game: Game, inviterId: string, error: string, password: string | undefined}[]>([]);
    }

    createInvite(inviterId: string, game: Game): void {
        let newInvite: {game: Game, inviterId: string, error: string, password: string | undefined} = {inviterId: inviterId, game: game, error: "", password: undefined};
        if (this.gameService.game.value && this.gameService.game.value.isProtected) {
            newInvite = {inviterId: inviterId, game: game, error: "", password: ""};
        }
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