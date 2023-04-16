import { Component, Inject, OnInit } from "@angular/core";
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GameService } from "@app/services/game/game.service";
import { StorageService } from "@app/services/storage/storage.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { ClientEvent } from "@app/utils/events/client-events";
import { Game } from "@app/utils/interfaces/game/game";
import { JoinGameAsObserverPayload, JoinGamePayload, JoinTournamentAsObserverPayload, JoinTournamentPayload } from "@app/utils/interfaces/packet";
import { BehaviorSubject } from "rxjs";
import { JoinProtectedGameComponent } from "@app/components/join-protected-game/join-protected-game.component";
import { Router } from "@angular/router";
import { JoinPrivateGameComponent } from "@app/components/join-private-game/join-private-game.component";
import { Tournament } from "@app/utils/interfaces/game/tournament";
import { JoinPrivateTournamentComponent } from "../join-private-tournament/join-private-tournament.component";

@Component({
    selector: "app-join-tournament",
    templateUrl: "./join-tournament.component.html",
    styleUrls: ["./join-tournament.component.scss"],
})
export class JoinTournamentComponent implements OnInit {
    tournaments: Tournament[] = [];
    tournamentToObserve: Tournament | undefined = undefined;
    constructor(public dialogRef: MatDialogRef<JoinTournamentComponent>, public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: {isObserver: boolean}, private gameService: GameService,
    private webSocketService: WebSocketService, private storageService: StorageService, private router: Router) {
        
    }

    ngOnInit(): void {
        if (!this.data.isObserver) {
            for (const tournament of this.gameService.joinableTournaments.value) {
                this.tournaments.push(tournament);
            }

            this.gameService.joinableGames.subscribe(() => {
                this.tournaments = [];
                for (const tournament of this.gameService.joinableTournaments.value) {
                    this.tournaments.push(tournament);
                }
            });
        } else {
            for (const tournament of this.gameService.observableTournaments.value) {
                this.tournaments.push(tournament);
            }

            /*for (const game of this.gameService.joinableGames.value) {
                if (oberIds.includes(game.id)) {
                    this.games.push(game);
                }
            }*/

            this.gameService.observableTournaments.subscribe(() => {
                this.tournaments = [];
                for (const tournament of this.gameService.observableTournaments.value) {
                    this.tournaments.push(tournament);
                }
    
                /*for (const game of this.gameService.joinableGames.value) {
                    if (oberIds.includes(game.id)) {
                        this.games.push(game);
                    }
                }*/
                //console.log(this.games);
            });
        }
    }

    getNumberOfObservers(tournament: Tournament): number {
        return tournament.observerIds.length;
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

    getCreatorName(tournament: Tournament): string {
        const creator = this.storageService.getUserFromId(tournament.creatorId);
        if (creator) {
            return creator.username;
        }
        return "";
    }

    // openDialogJoinProtectedGame(game: Game): void {
    //     const dialogConfig = new MatDialogConfig();
    //     dialogConfig.disableClose = true;
    //     this.dialog.open(JoinProtectedGameComponent, {
    //         data: {game: game, isObserver: this.data.isObserver}
    //     });
    // }

    openDialogJoinPrivateGame(tournament: Tournament): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        this.dialog.open(JoinPrivateTournamentComponent, {
            disableClose: true,
            data: {tournament: tournament}
        });
    }

    joinGame(tournament: Tournament): void {
        if (tournament.isPrivate) {
            this.openDialogJoinPrivateGame(tournament);
            const payload: JoinTournamentPayload = {
                tournamentId: tournament.id,
                password: ""
            }
            const event : ClientEvent = "join-game";
            this.webSocketService.send(event, payload);
            this.close();
        } else {
            if (this.data.isObserver) {
                const payload: JoinTournamentAsObserverPayload = {
                    tournamentId: tournament.id
                    // password: ""
                }
                const event : ClientEvent = "join-tournament-as-observateur";
                this.webSocketService.send(event, payload);
                this.gameService.isObserving = true;
                this.tournamentToObserve = tournament;
                this.close();
                //this.router.navigate(["/gameObserve"]);
            } else {
                const payload: JoinTournamentPayload = {
                    tournamentId: tournament.id,
                    password: ""
                }
                const event : ClientEvent = "join-tournament";
                this.webSocketService.send(event, payload);
                this.close();
            }
        }
    }

    close() {
        this.dialogRef.close();
    }

    joinGameAsObserver(game: Game): void {
        const payload: JoinGameAsObserverPayload = {
            gameId: game.id,
            password: ""
        }
        const event : ClientEvent = "join-game-as-observateur";
        this.webSocketService.send(event, payload);
        this.gameService.isObserving = true;
        this.close();
        this.router.navigate(["/gameObserve"]);
    }
}