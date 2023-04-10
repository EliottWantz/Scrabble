import { Component, ElementRef, QueryList, ViewChildren } from "@angular/core";
import { Router } from "@angular/router";
import { CommunicationService } from "@app/services/communication/communication.service";
import { GameService } from "@app/services/game/game.service";
import { InviteService } from "@app/services/invite/invite.service";
import { StorageService } from "@app/services/storage/storage.service";
import { UserService } from "@app/services/user/user.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { Game } from "@app/utils/interfaces/game/game";
import { LeaveGamePayload } from "@app/utils/interfaces/packet";

@Component({
    selector: "app-invite",
    templateUrl: "./invite.component.html",
    styleUrls: ["./invite.component.scss"],
})
export class InviteComponent {
    invites: {inviterId: string, game: Game, error: string, password: string | undefined}[] = [];
    constructor(private storageService: StorageService, private commService: CommunicationService, private userService: UserService, private inviteService: InviteService,
        private gameService: GameService, private webSocketService: WebSocketService, private router: Router) {
        this.inviteService.invites.subscribe((invites) => {
            this.invites = invites;
        });
    }

    //@ViewChildren("password") passwordsElems!: QueryList<ElementRef>;

    getAvatarInvite(index: number): string {
        const avatar = this.storageService.getAvatar(this.invites[index].inviterId);
        if (avatar) return avatar;
        return '';
    }

    getInviterName(index: number): string {
        const user = this.storageService.getUserFromId(this.invites[index].inviterId);
        if (user) return user.username;
        return '';
    }

    acceptInvite(index: number): void {
        if (this.gameService.game.value !== undefined) {
            const payload: LeaveGamePayload = {
                gameId: this.gameService.game.value.id
            } 
            this.webSocketService.send("leave-game", payload);
            this.router.navigate(["/home"]);
        }
        let currentPassword = this.invites[index].password;
        if (currentPassword === undefined) {
            currentPassword = "";
        }
        this.commService.acceptGameInvite(this.userService.currentUserValue.id, this.invites[index].inviterId, this.invites[index].game.id, currentPassword).then((res) => {
            //const newInvites = this.invites.splice(index, 1);
            //this.inviteService.invites.next(newInvites);
            console.log(res);
        }).catch((err) => {
            if (err.error.message == "password mismatch") {
                this.invites[index].error = "password missmatch";
            } else {
                this.invites.splice(index, 1);
            }
            console.log(err);
        });
    }

    denyInvite(index: number): void {
        //const newInvites = this.invites.splice(index, 1);
        //this.inviteService.invites.next(newInvites);
        this.invites.splice(index, 1);
        let currentPassword = this.invites[index].password;
        if (currentPassword === undefined) {
            currentPassword = "";
        }
        this.commService.declineGameInvite(this.invites[index].inviterId, this.userService.currentUserValue.id, this.invites[index].game.id, currentPassword).then((res) => {
            console.log(res);
        }).catch((err) => {
            this.invites.splice(index, 1);
            console.log(err);
        });
    }
}