import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { CommunicationService } from "@app/services/communication/communication.service";
import { InviteService } from "@app/services/invite/invite.service";
import { StorageService } from "@app/services/storage/storage.service";
import { UserService } from "@app/services/user/user.service";
import { Game } from "@app/utils/interfaces/game/game";
import { JoinPrivateGameComponent } from "@app/components/join-private-game/join-private-game.component";

@Component({
    selector: "app-invite",
    templateUrl: "./invite.component.html",
    styleUrls: ["./invite.component.scss"],
})
export class InviteComponent {
    invites: {inviterId: string, game: Game, error: string, password: string | undefined}[] = [];
    constructor(private storageService: StorageService, private commService: CommunicationService, private userService: UserService, private inviteService: InviteService,
        public dialog: MatDialog) {
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

    openDialogJoinPrivateGame(game: Game): void {
        this.dialog.open(JoinPrivateGameComponent, {
            disableClose: true,
            data: {game: game}
        });
    }

    acceptInvite(index: number): void {
        if (this.invites[index].game.isProtected && this.invites[index].password === "") {
            this.invites[index].error = "password-required";
            return;
        }
        let currentPassword = this.invites[index].password;
        if (currentPassword === undefined) {
            currentPassword = "";
        }
        this.commService.acceptGameInvite(this.invites[index].inviterId, this.userService.currentUserValue.id, this.invites[index].game.id, currentPassword).then((res) => {
            console.log(res);
        }).catch((err) => {
            if (err.error.message == "password mismatch") {
                this.invites[index].error = "password-mismatch";
            } else if (err.error.message == "game not found") {
                this.invites[index].error = "game-not-found";
            } else {
                if (this.invites[index].game.isPrivateGame) {
                    this.openDialogJoinPrivateGame(this.invites[index].game);
                }
                this.invites.splice(index, 1);
            }
            console.log(err);
        });
    }

    denyInvite(index: number): void {
        this.commService.declineGameInvite(this.invites[index].inviterId, this.userService.currentUserValue.id, this.invites[index].game.id, "").then((res) => {
            console.log(res);
        }).catch((err) => {
            this.invites.splice(index, 1);
            console.log(err);
        });
    }
}