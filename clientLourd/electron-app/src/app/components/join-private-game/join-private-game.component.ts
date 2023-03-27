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

@Component({
    selector: "app-join-private-game",
    templateUrl: "./join-private-game.component.html",
    styleUrls: ["./join-private-game.component.scss"],
})
export class JoinPrivateGameComponent {
    password = "";
    errorMessage = "";
    constructor(public dialogRef: MatDialogRef<JoinPrivateGameComponent>, @Inject(MAT_DIALOG_DATA) public data: {game: Game}, private webSocketService: WebSocketService, private storageService: StorageService) {
        this.webSocketService.error.subscribe(() => {
            if (this.webSocketService.error.value === "password mismatch") {
                this.errorMessage = "Mot de passe incorrect";
            }
        });
    }

    getUserNames(ids: string[]): string[] {
        const names = [];
        for (const id of ids) {
            const user = this.storageService.getUserFromId(id);
            if (user) {
                names.push(user.username);
            }
        }
        return names;
    }

    joinGame(): void {
        console.log(this.password);
        const payload: JoinGamePayload = {
            gameId: this.data.game.id,
            password: this.password
        }
        const event : ClientEvent = "join-game";
        this.webSocketService.send(event, payload);
    }

    close() {
        this.dialogRef.close();
    }
}