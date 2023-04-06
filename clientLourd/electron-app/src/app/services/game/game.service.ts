import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BoardHelper } from "@app/classes/board-helper";
import { Game, ScrabbleGame } from "@app/utils/interfaces/game/game";
import { MoveInfo } from "@app/utils/interfaces/game/move";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class GameService {
    scrabbleGame!: BehaviorSubject<ScrabbleGame | undefined>;
    game!: BehaviorSubject<Game | undefined>;
    timer!: BehaviorSubject<number>;
    moves!: BehaviorSubject<MoveInfo[]>;
    joinableGames!: BehaviorSubject<Game[]>;
    gameWinner!:BehaviorSubject<string | undefined>
    observableGames!: BehaviorSubject<Game[]>;
    isObserving = false;
    usersWaiting!: BehaviorSubject<{userId: string, username: string}[]>;
    wasDeclined!: BehaviorSubject<boolean>;
    constructor(private router: Router) {
        this.scrabbleGame = new BehaviorSubject<ScrabbleGame | undefined>(undefined);
        this.game = new BehaviorSubject<Game | undefined>(undefined);
        this.joinableGames = new BehaviorSubject<Game[]>([]);
        this.timer = new BehaviorSubject<number>(0);
        this.moves = new BehaviorSubject<MoveInfo[]>([]);
        this.observableGames = new BehaviorSubject<Game[]>([]);
        this.usersWaiting = new BehaviorSubject<{userId: string, username: string}[]>([]);
        this.wasDeclined = new BehaviorSubject<boolean>(false);
    }

    updateGame(game: ScrabbleGame): void {
        console.log(game);
        this.scrabbleGame.next(game);
        this.timer.next(game.timer / 1000000000);
        this.moves.next([]);
        if (!this.isObserving) {
            this.router.navigate(['/', 'game']);
        } else {
            this.router.navigate(['/', 'gameObserve']);
        }
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
    gameOverPopup(winId : string){
        let winner = "";
        if(!this.scrabbleGame.value){
            return
        }
        for(const user of this.scrabbleGame.value.players){
            if(user.id === winId){
                winner = user.username
            }
        }
        this.gameWinner.next(winner);
    }
}