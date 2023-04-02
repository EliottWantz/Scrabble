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

@Component({
    selector: "app-join-game",
    templateUrl: "./join-game.component.html",
    styleUrls: ["./join-game.component.scss"],
})
export class JoinGameComponent implements OnInit {
    games: Game[] = [];
    constructor(public dialogRef: MatDialogRef<JoinGameComponent>, public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: {isObserver: boolean}, private gameService: GameService,
    private webSocketService: WebSocketService, private storageService: StorageService, private router: Router) {
        
    }

    ngOnInit(): void {
        if (!this.data.isObserver) {
            for (const game of this.gameService.joinableGames.value) {
                this.games.push(game);
            }

            this.gameService.joinableGames.subscribe(() => {
                this.games = [];
                for (const game of this.gameService.joinableGames.value) {
                    this.games.push(game);
                }
            });
        } else {
            const oberIds = [];
            for (const game of this.gameService.observableGames.value) {
                oberIds.push(game.id);
            }

            for (const game of this.gameService.joinableGames.value) {
                if (oberIds.includes(game.id)) {
                    this.games.push(game);
                }
            }

            this.gameService.observableGames.subscribe(() => {
                this.games = [];
                const oberIds = [];
                for (const game of this.gameService.observableGames.value) {
                    oberIds.push(game.id);
                }
    
                for (const game of this.gameService.joinableGames.value) {
                    if (oberIds.includes(game.id)) {
                        this.games.push(game);
                    }
                }
                console.log(this.games);
            });
        }
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

    getCreatorName(game: Game): string {
        const creator = this.storageService.getUserFromId(game.creatorId);
        if (creator) {
            return creator.username;
        }
        return "";
    }

    openDialogJoinPrivateGame(game: Game): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        this.dialog.open(JoinProtectedGameComponent, {width: '75%',
            minHeight: '70vh',
            height : '50vh',
            data: {game: game, isObserver: this.data.isObserver}
        });
    }

    joinGame(game: Game): void {
        //this.stepper.selectedIndex = STEPPER_PAGE_IDX.confirmationPage;
        if (game.isProtected) {
            this.openDialogJoinPrivateGame(game);
            this.close();
        } else {
            if (this.data.isObserver) {
                const payload: JoinGameAsObserverPayload = {
                    gameId: game.id,
                    password: ""
                }
                const event : ClientEvent = "join-game-as-observateur";
                this.webSocketService.send(event, payload);
                this.gameService.isObserving = true;
                this.close();
                this.router.navigate(["/gameObserve"]);
            } else {
                const payload: JoinGamePayload = {
                    gameId: game.id,
                    password: ""
                }
                const event : ClientEvent = "join-game";
                this.webSocketService.send(event, payload);
                this.close();
            }
        }
    }

    close() {
        this.dialogRef.close();
    }
}