import { Component, Inject, OnInit } from "@angular/core";
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GameService } from "@app/services/game/game.service";
import { StorageService } from "@app/services/storage/storage.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { ClientEvent } from "@app/utils/events/client-events";
import { Game } from "@app/utils/interfaces/game/game";
import { JoinGameAsObserverPayload, JoinGamePayload, JoinTournamentAsObserverPayload, LeaveTournamentPayload } from "@app/utils/interfaces/packet";
import { BehaviorSubject } from "rxjs";
import { JoinProtectedGameComponent } from "@app/components/join-protected-game/join-protected-game.component";
import { Router } from "@angular/router";
import { JoinPrivateGameComponent } from "@app/components/join-private-game/join-private-game.component";

@Component({
    selector: "app-tournament-over",
    templateUrl: "./tournament-over.component.html",
    styleUrls: ["./tournament-over.component.scss"],
})
export class TournamentOverComponent {
    constructor(public dialogRef: MatDialogRef<TournamentOverComponent>, public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: {isWinner: boolean}, private gameService: GameService,
        private webSocketService: WebSocketService, private router: Router) {
    }

    close() {
        if(this.gameService.tournament.value){
            const payload: LeaveTournamentPayload = {
                tournamentId: this.gameService.tournament.value?.id
            };
            this.webSocketService.send("leave-tournament", payload);
            this.gameService.game.next(undefined);
            this.gameService.tournament.next(undefined);
            this.gameService.scrabbleGame.next(undefined);
        }
        this.router.navigate(["/home"]);
        this.dialogRef.close();
    }
}