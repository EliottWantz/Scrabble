import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BoardHelper } from "@app/classes/board-helper";
import { Game } from "@app/utils/interfaces/game/game";
import { Player } from "@app/utils/interfaces/game/player";
import { GameUpdatePayload } from "@app/utils/interfaces/packet";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class GameService {
    game!: BehaviorSubject<Game>;
    timer!: BehaviorSubject<number>;
    constructor(private router: Router) {
        this.game = new BehaviorSubject<Game>({
            id: "",
            players: [],
            board: BoardHelper.createBoard(),
            finished: false,
            numPassMoves: 0,
            turn: "",
            timer: 0,
        });
        this.timer = new BehaviorSubject<number>(0);
    }

    updateGame(game: GameUpdatePayload): void {
        this.game.next(game.game);
        this.timer.next(game.game.timer / 1000000000);
        this.router.navigate(['/', 'game']);
    }

    updateTimer(timer: number): void {
        this.timer.next(timer  / 1000000000);
    }
}