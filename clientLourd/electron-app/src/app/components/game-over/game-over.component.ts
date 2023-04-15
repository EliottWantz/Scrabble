import { Component, Inject, OnInit } from "@angular/core";
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GameService } from "@app/services/game/game.service";
import { StorageService } from "@app/services/storage/storage.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { ClientEvent } from "@app/utils/events/client-events";
import { Game } from "@app/utils/interfaces/game/game";
import { JoinGameAsObserverPayload, JoinGamePayload } from "@app/utils/interfaces/packet";
import { BehaviorSubject } from "rxjs";
import { JoinProtectedGameComponent } from "@app/components/join-protected-game/join-protected-game.component";
import { Router } from "@angular/router";
import { JoinPrivateGameComponent } from "@app/components/join-private-game/join-private-game.component";

@Component({
    selector: "app-game-over",
    templateUrl: "./game-over.component.html",
    styleUrls: ["./game-over.component.scss"],
})
export class GameOverComponent {
    games: Game[] = [];
    constructor(public dialogRef: MatDialogRef<GameOverComponent>, public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: {isWinner: boolean, isObserving: boolean}, private gameService: GameService,
    private webSocketService: WebSocketService, private storageService: StorageService, private router: Router) {
        
    }

    close() {
        this.router.navigate(["/home"]);
        this.dialogRef.close();
    }
}