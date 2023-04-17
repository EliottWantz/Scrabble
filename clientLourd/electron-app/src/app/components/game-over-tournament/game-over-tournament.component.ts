import { Component, Inject } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GameService } from "@app/services/game/game.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { JoinGameAsObserverPayload, LeaveTournamentPayload } from "@app/utils/interfaces/packet";
import { Router } from "@angular/router";

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
                payload = {
                    gameId: this.gameService.tournament.value?.finale?.id as string,
                    password: ""
                }
            } else if (this.gameService.tournament.value.poolGames[0].id === this.data.oldGameId && this.gameService.tournament.value.poolGames[1].winnerId === "") {
                payload = {
                    gameId: this.gameService.tournament.value?.poolGames[1]?.id as string,
                    password: ""
                }
            } else if (this.gameService.tournament.value.poolGames[1].id === this.data.oldGameId && this.gameService.tournament.value.poolGames[0].winnerId === "") {
                payload = {
                    gameId: this.gameService.tournament.value?.poolGames[0]?.id as string,
                    password: ""
                }
            }
            
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