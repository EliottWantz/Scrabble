import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { GameService } from "@app/services/game/game.service";
import { StorageService } from "@app/services/storage/storage.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { ClientEvent } from "@app/utils/events/client-events";
import { Game } from "@app/utils/interfaces/game/game";
import { JoinGamePayload } from "@app/utils/interfaces/packet";
import { BehaviorSubject } from "rxjs";

@Component({
    selector: "app-create-game",
    templateUrl: "./create-game.component.html",
    styleUrls: ["./create-game.component.scss"],
})
export class CreateGameComponent {
    games: BehaviorSubject<Game[]>;
    gameModes = ["Classique", "Coopératif"];
    selectedGameMode = "Classique";
    password = "";
    isPrivate = false;
    constructor(public dialogRef: MatDialogRef<CreateGameComponent>, private gameService: GameService, private webSocketService: WebSocketService, private storageService: StorageService) {
        this.games = this.gameService.joinableGames;
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

    joinGame(gameId: string, password: string): void {
        //this.stepper.selectedIndex = STEPPER_PAGE_IDX.confirmationPage;
        const payload: JoinGamePayload = {
            gameId: gameId,
            password: password
          }
          const event : ClientEvent = "join-game";
          this.webSocketService.send(event, payload);
    }

    close() {
        this.dialogRef.close();
    }
}