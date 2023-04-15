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
    selector: "app-game-over-tournament",
    templateUrl: "./game-over-tournament.component.html",
    styleUrls: ["./game-over-tournament.component.scss"],
})
export class GameOverTournamentComponent {
    constructor(public dialogRef: MatDialogRef<GameOverTournamentComponent>, public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: {isWinner: boolean, isObserving: boolean, oldGameId: string}, private gameService: GameService,
        private webSocketService: WebSocketService, private router: Router) {
    }

    joinTournamentAsObserver(): void {
        if(this.gameService.tournament.value){
            let payload: JoinGameAsObserverPayload = {
                gameId: this.gameService.tournament.value?.finale?.id as string,
                password: ""
            }
            if (this.gameService.tournament.value.poolGames[0].winnerId !== "" && this.gameService.tournament.value.poolGames[1].winnerId !== "") {
                //this.gameService.game.next(this.gameService.tournament.value.finale);
                payload = {
                    gameId: this.gameService.tournament.value?.finale?.id as string,
                    password: ""
                }
            } else if (this.gameService.tournament.value.poolGames[0].id === this.data.oldGameId && this.gameService.tournament.value.poolGames[1].winnerId === "") {
                //this.gameService.game.next(this.gameService.tournament.value.poolGames[1]);
                payload = {
                    gameId: this.gameService.tournament.value?.poolGames[1]?.id as string,
                    password: ""
                }
            } else if (this.gameService.tournament.value.poolGames[1].id === this.data.oldGameId && this.gameService.tournament.value.poolGames[0].winnerId === "") {
                payload = {
                    gameId: this.gameService.tournament.value?.poolGames[0]?.id as string,
                    password: ""
                }
                //this.gameService.game.next(this.gameService.tournament.value.poolGames[0]);
            }
            /*const payload: JoinTournamentAsObserverPayload = {
                tournamentId: this.gameService.tournament.value?.id
            };*/
            //this.webSocketService.send("join-tournament-as-observateur", payload);
            /*if(this.gameService.tournament.value?.games[0].winnerId && this.gameService.tournament.value?.games[1].winnerId)
            {
                const payload: JoinGameAsObserverPayload = {
                    gameId: this.gameService.tournament.value?.finale?.id as string,
                    password: ""
                }
            }
            else{
                const payload: JoinGameAsObserverPayload = {
                    gameId: this.gameService.tournament.value?.games.splice(this.gameService.tournament.value?.games.indexOf(this.gameService.game.value as Game), 1)[0].id as string,
                    password: ""
                }
            }*/
            this.webSocketService.send("join-game-as-observateur", payload);
            this.gameService.isObserving = true;
            this.close();
            this.router.navigate(["/gameObserve"]);
        }
    }

    isTournamentOver(): boolean {
        return this.gameService.tournament.value?.finale?.winnerId !== "";
    }

    checkIfGameIsFinale(): boolean {
        return this.gameService.tournament.value?.finale?.id === this.data.oldGameId;
    }

    leaveTournament(): void {
        if(this.gameService.tournament.value){
            const payload: LeaveTournamentPayload = {
                tournamentId: this.gameService.tournament.value?.id
            };
            this.webSocketService.send("leave-tournament", payload);
            this.gameService.game.next(undefined);
            this.gameService.tournament.next(undefined);
            this.gameService.scrabbleGame.next(undefined);
            this.close();
            this.router.navigate(["/home"]);
        }
    }

    close() {
        this.dialogRef.close();
    }
}