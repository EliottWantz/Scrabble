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

@Component({
    selector: "app-join-protected-game",
    templateUrl: "./join-protected-game.component.html",
    styleUrls: ["./join-protected-game.component.scss"],
})
export class JoinProtectedGameComponent {
    password = "";
    errorMessage = "";
    constructor(public dialogRef: MatDialogRef<JoinProtectedGameComponent>, @Inject(MAT_DIALOG_DATA) public data: {game: Game, isObserver: boolean},
        private webSocketService: WebSocketService, private storageService: StorageService, private gameService: GameService, private router: Router
    ) {
        this.webSocketService.error.subscribe(() => {
            if (this.webSocketService.error.value === "password mismatch") {
                this.errorMessage = "Mot de passe incorrect";
                this.gameService.isObserving = false;
            }
        });

        this.router.events.subscribe((e) => {
            if (e instanceof NavigationStart) {
                this.close();
            }});
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
        if (this.data.isObserver) {
            const payload: JoinGamePayload = {
                gameId: this.data.game.id,
                password: ""
            }
            const event : ClientEvent = "join-game-as-observateur";
            this.webSocketService.send(event, payload);
            // if password is correct
            this.gameService.isObserving = true;
            this.router.navigate(["/gameObserve"]);
            this.close();
        }  else {
            console.log(this.password);
            const payload: JoinGamePayload = {
                gameId: this.data.game.id,
                password: this.password
            }
            const event : ClientEvent = "join-game";
            this.webSocketService.send(event, payload);
        }
    }

    close() {
        this.dialogRef.close();
    }
}