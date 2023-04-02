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
import { Router } from "@angular/router";

@Component({
    selector: "app-join-private-game",
    templateUrl: "./join-private-game.component.html",
    styleUrls: ["./join-private-game.component.scss"],
})
export class JoinPrivateGameComponent {
    password = "";
    errorMessage = "";
    constructor(public dialogRef: MatDialogRef<JoinPrivateGameComponent>, @Inject(MAT_DIALOG_DATA) public data: {game: Game}, 
        private webSocketService: WebSocketService, private gameService: GameService
    ) {
        this.webSocketService.error.subscribe(() => {
            if (this.webSocketService.error.value === "password mismatch") {
                this.errorMessage = "Mot de passe incorrect";
                this.gameService.isObserving = false;
            }
        });
    }

    close() {
        // annuler la demande
        this.dialogRef.close();
    }
}