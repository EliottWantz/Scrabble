import { Injectable } from "@angular/core";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { Router } from "@angular/router";
import { BoardHelper } from "@app/classes/board-helper";
import { AdviceComponent } from "@app/components/advice/advice.component";
import { ChooseLetterComponent } from "@app/components/choose-letter/choose-letter.component";
import { Game, ScrabbleGame } from "@app/utils/interfaces/game/game";
import { MoveInfo } from "@app/utils/interfaces/game/move";
import { Tile } from "@app/utils/interfaces/game/tile";
import { Tournament } from "@app/utils/interfaces/game/tournament";
import { StorageService } from "@app/services/storage/storage.service";
import { BehaviorSubject } from "rxjs";
import { GameOverTournamentComponent } from "@app/components/game-over-tournament/game-over-tournament.component";
import { UserService } from "@app/services/user/user.service";
import { MatDialog } from "@angular/material/dialog";
import { GameOverComponent } from "@app/components/game-over/game-over.component";
import { TournamentOverComponent } from "@app/components/tournament-over/tournament-over.component";

@Injectable({
    providedIn: 'root',
})
export class GameService {
    scrabbleGame!: BehaviorSubject<ScrabbleGame | undefined>;
    game!: BehaviorSubject<Game | undefined>;
    tournament!: BehaviorSubject<Tournament | undefined>;
    timer!: BehaviorSubject<number>;
    //moves!: BehaviorSubject<MoveInfo[]>;
    joinableGames!: BehaviorSubject<Game[]>;
    joinableTournaments!: BehaviorSubject<Tournament[]>;
    gameWinner!:BehaviorSubject<string | undefined>
    tournamentWinner!:BehaviorSubject<string | undefined>
    observableGames!: BehaviorSubject<Game[]>;
    observableTournaments!: BehaviorSubject<Tournament[]>;
    isObserving = false;
    usersWaiting!: BehaviorSubject<{userId: string, username: string}[]>;
    wasDeclined!: BehaviorSubject<boolean>;
    selectedTiles: Tile[] = [];
    placedTiles = 0;
    oldGame!: ScrabbleGame;
    dragging = new BehaviorSubject<boolean>(false);
    hasWon = false;
    constructor(private router: Router, private _bottomSheet: MatBottomSheet, private _bottomSheetSpecialLetter: MatBottomSheet, private storageService: StorageService,
        private userService: UserService, public dialog: MatDialog){
        this.scrabbleGame = new BehaviorSubject<ScrabbleGame | undefined>(undefined);
        this.game = new BehaviorSubject<Game | undefined>(undefined);
        this.tournament = new BehaviorSubject<Tournament | undefined>(undefined);
        this.joinableGames = new BehaviorSubject<Game[]>([]);
        this.joinableTournaments = new BehaviorSubject<Tournament[]>([]);
        this.timer = new BehaviorSubject<number>(0);
        //this.moves = new BehaviorSubject<MoveInfo[]>([]);
        this.observableGames = new BehaviorSubject<Game[]>([]);
        this.observableTournaments = new BehaviorSubject<Tournament[]>([]);
        this.usersWaiting = new BehaviorSubject<{userId: string, username: string}[]>([]);
        this.wasDeclined = new BehaviorSubject<boolean>(false);
        this.gameWinner = new BehaviorSubject<string | undefined>(undefined);
        this.tournamentWinner = new BehaviorSubject<string | undefined>(undefined);
    }

    indice(moves: MoveInfo[]): void {
        this._bottomSheet.open(AdviceComponent, {data: {moves: moves}});
    }

    specialLetter( x: number, y: number) {
        this._bottomSheet.open(ChooseLetterComponent, {data: { x: x, y: y}});
    }

    resetSelectedAndPlaced(): void {
        this.placedTiles = 0;
        this.selectedTiles = [];
        if (this.scrabbleGame.value) {
            const newBoard = JSON.stringify(this.oldGame.board);
            const newPlayers = JSON.stringify(this.oldGame.players);
            this.scrabbleGame.next({...this.scrabbleGame.value, board: JSON.parse(newBoard), players: JSON.parse(newPlayers)});
        }
    }

    updateGame(game: ScrabbleGame): void {
        //console.log(game);
        this.dragging.next(false);
        this.oldGame = JSON.parse(JSON.stringify(game));
        this.scrabbleGame.next(game);
        this.timer.next(game.timer / 1000000000);
        //this.moves.next([]);
        if (!this.isObserving) {
            this.router.navigate(['/', 'game']);
        } else {
            this.router.navigate(['/', 'gameObserve']);
        }
        this._bottomSheet.dismiss();
    }

    updateTimer(timer: number): void {
        this.timer.next(timer  / 1000000000);
    }

    addUser(gameId: string, userId: string): void {
        if (this.game.value && this.game.value.id == gameId) {
            const users = this.game.value.userIds;
            users.push(userId);
            this.game.next({...this.game.value, userIds: users});
        } else {
            for (let i = 0; i < this.joinableGames.value.length; i++) {
                if (this.joinableGames.value[i].id == gameId) {
                    const games = this.joinableGames.value;
                    games[i].userIds.push(userId);
                    this.joinableGames.next(games);
                }
            }
        }
    }

    addUserTournament(tournamentId: string, userId: string): void {
        if (this.tournament.value && this.tournament.value.id == tournamentId) {
            const users = this.tournament.value.userIds;
            users.push(userId);
            this.tournament.next({...this.tournament.value, userIds: users});
        } else {
            for (let i = 0; i < this.joinableTournaments.value.length; i++) {
                if (this.joinableTournaments.value[i].id == tournamentId) {
                    const tournaments = this.joinableTournaments.value;
                    tournaments[i].userIds.push(userId);
                    this.joinableTournaments.next(tournaments);
                }
            }
        }
    }

    removeUser(gameId: string, userId: string): void {
        if (this.game.value && this.game.value.id == gameId) {
            const users = this.game.value.userIds;
            const indexUser = this.game.value.userIds.indexOf(userId, 0);
            if (indexUser > -1) {
                this.game.value.userIds.splice(indexUser, 1);
            }
            this.game.next({...this.game.value, userIds: users});
            if (this.game.value.userIds.length == 0) {
                this.game.next({...this.game.value, id: "0"});
            }
        } else {
            for (let i = 0; i < this.joinableGames.value.length; i++) {
                if (this.joinableGames.value[i].id == gameId) {
                    const games = this.joinableGames.value;
                    const indexUser = games[i].userIds.indexOf(userId, 0);
                    if (indexUser > -1) {
                        games[i].userIds.splice(indexUser, 1);
                        if (games[i].userIds.length == 0) {
                            games.splice(i, 1);
                        }
                    }
                    this.joinableGames.next(games);
                }
            }
        }
    }

    removeUserTournament(tournamentId: string, userId: string): void {
        if (this.tournament.value && this.tournament.value.id == tournamentId) {
            const users = this.tournament.value.userIds;
            const indexUser = this.tournament.value.userIds.indexOf(userId, 0);
            if (indexUser > -1) {
                this.tournament.value.userIds.splice(indexUser, 1);
            }
            this.tournament.next({...this.tournament.value, userIds: users});
            if (this.tournament.value.userIds.length == 0) {
                this.tournament.next({...this.tournament.value, id: "0"});
            }
        } else {
            for (let i = 0; i < this.joinableTournaments.value.length; i++) {
                if (this.joinableTournaments.value[i].id == tournamentId) {
                    const tournaments = this.joinableTournaments.value;
                    const indexUser = tournaments[i].userIds.indexOf(userId, 0);
                    if (indexUser > -1) {
                        tournaments[i].userIds.splice(indexUser, 1);
                        if (tournaments[i].userIds.length == 0) {
                            tournaments.splice(i, 1);
                        }
                    }
                    this.joinableTournaments.next(tournaments);
                }
            }
        }
    }

    gameOverPopup(winId : string){
        if (this.tournament.value) {
            if (this.tournament.value.finale && this.game.value) {
                if (this.game.value.id === this.tournament.value.finale.id) {
                    if (winId === this.userService.currentUserValue.id) {
                        this.dialog.open(TournamentOverComponent, {width: '75%',
                                disableClose: true,
                                data: {isWinner: true}});
                    } else {
                        this.dialog.open(TournamentOverComponent, {width: '75%',
                                disableClose: true,
                                data: {isWinner: false}});
                    }
                    return;
                }
            }
            if (this.tournament.value.observerIds.indexOf(this.userService.currentUserValue.id) == -1 && this.game.value?.userIds.indexOf(this.userService.currentUserValue.id) == -1 && this.hasWon) {
                                return;
            }
            
            if (this.game.value && this.userService.currentUserValue.id === winId) {
                this.hasWon = true;
                this.dialog.open(GameOverTournamentComponent, {width: '75%',
                                disableClose: true,
                                data: {isWinner: true, isObserving: this.isObserving, oldGameId: this.game.value.id}});
            } else if (this.game.value) {
                this.dialog.open(GameOverTournamentComponent, {width: '75%',
                                disableClose: true,
                                data: {isWinner: false, isObserving: this.isObserving, oldGameId: this.game.value.id}});
            }
        } else {
            if (this.game.value && this.userService.currentUserValue.id === winId) {
                this.dialog.open(GameOverComponent, {width: '75%',
                                disableClose: true,
                                data: {isWinner: true, isObserving: this.isObserving}});
            } else {
                this.dialog.open(GameOverComponent, {width: '75%',
                                disableClose: true,
                                data: {isWinner: false, isObserving: this.isObserving}});
            }
        }
    }

    gameOverPopupTournament(winId : string){
        let winner = undefined;
        winner = this.storageService.getUserFromId(winId)?.username;
        this.tournamentWinner.next(winner);
    }
}