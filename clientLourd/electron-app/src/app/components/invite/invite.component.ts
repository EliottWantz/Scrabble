import { Component } from "@angular/core";
import { CommunicationService } from "@app/services/communication/communication.service";
import { InviteService } from "@app/services/invite/invite.service";
import { StorageService } from "@app/services/storage/storage.service";
import { UserService } from "@app/services/user/user.service";
import { Game } from "@app/utils/interfaces/game/game";

@Component({
    selector: "app-invite",
    templateUrl: "./invite.component.html",
    styleUrls: ["./invite.component.scss"],
})
export class InviteComponent {
    invites: {inviterId: string, game: Game}[] = [];
    passwords: string[] = [];
    error = "";
    constructor(private storageService: StorageService, private commService: CommunicationService, private userService: UserService, private inviteService: InviteService) {
        this.inviteService.invites.subscribe((invites) => {
            this.invites = invites;
        });
    }

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
        this.commService.acceptGameInvite(this.userService.currentUserValue.id, this.invites[index].inviterId, this.invites[index].game.id, this.passwords[index]).then((res) => {
            //const newInvites = this.invites.splice(index, 1);
            //this.inviteService.invites.next(newInvites);
            console.log(res);
        }).catch((err) => {
            if (err.error.message == "password mismatch") {
                this.error = "password missmatch";
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
        this.commService.declineGameInvite(this.invites[index].inviterId, this.userService.currentUserValue.id, this.invites[index].game.id, this.passwords[index]).then((res) => {
            console.log(res);
        }).catch((err) => {
            if (err.error.message == "password mismatch") {
                this.error = "password missmatch";
            } else {
                this.invites.splice(index, 1);
            }
            console.log(err);
        });
    }
}