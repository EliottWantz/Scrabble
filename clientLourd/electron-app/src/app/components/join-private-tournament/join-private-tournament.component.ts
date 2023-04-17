import { Component, Inject } from "@angular/core";
import { MatDialog, MatDialogConfig, MatDialogRef } from "@angular/material/dialog";
import { GameService } from "@app/services/game/game.service";
import { StorageService } from "@app/services/storage/storage.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { ClientEvent } from "@app/utils/events/client-events";
import { Game } from "@app/utils/interfaces/game/game";
import { JoinGamePayload } from "@app/utils/interfaces/packet";
import { BehaviorSubject } from "rxjs";
import  {MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NavigationStart, Router } from "@angular/router";
import { CommunicationService } from "@app/services/communication/communication.service";
import { UserService } from "@app/services/user/user.service";
import { Tournament } from "@app/utils/interfaces/game/tournament";

@Component({
    selector: "app-join-private-tournament",
    templateUrl: "./join-private-tournament.component.html",
    styleUrls: ["./join-private-tournament.component.scss"],
})
export class JoinPrivateTournamentComponent {
    wasDeclined = false;
    constructor(public dialogRef: MatDialogRef<JoinPrivateTournamentComponent>, @Inject(MAT_DIALOG_DATA) public data: {tournament: Tournament}, 
        private webSocketService: WebSocketService, private gameService: GameService, private storageService: StorageService, private router: Router,
        private commService: CommunicationService, private userSerive: UserService) {
        this.gameService.wasDeclined.subscribe((wasDeclined) => {
            this.wasDeclined = wasDeclined;
        });

        this.router.events.subscribe((e) => {
            if (e instanceof NavigationStart) {
                this.close();
            }});
    }

    getCreatorName(): string {
        const creator = this.storageService.getUserFromId(this.data.tournament.creatorId);
        if (creator) {
            return creator.username;
        }
        return "";
    }

    close(): void {
        this.gameService.wasDeclined.next(false);
        this.dialogRef.close();
    }

    cancel(): void {
        // annuler la demande
        this.commService.revokeJoinGame(this.userSerive.currentUserValue.id, this.data.tournament.id).subscribe({
            next: () => {
              //console.log("canceled");
            },
            error: (err) => {
              //console.log(err);
            }
          });
        this.dialogRef.close();
    }
}