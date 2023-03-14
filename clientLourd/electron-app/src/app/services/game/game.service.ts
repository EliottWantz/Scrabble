import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BoardHelper } from "@app/classes/board-helper";
import { Game } from "@app/utils/interfaces/game/game";
import { MoveInfo } from "@app/utils/interfaces/game/move";
import { GameUpdatePayload } from "@app/utils/interfaces/packet";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class GameService {
    game!: BehaviorSubject<Game>;
    timer!: BehaviorSubject<number>;
    moves!: BehaviorSubject<MoveInfo[]>;
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
        this.moves = new BehaviorSubject<MoveInfo[]>([]);
    }

    updateGame(game: GameUpdatePayload): void {
        this.game.next(game.game);
        this.timer.next(game.game.timer / 1000000000);
        this.moves.next([]);
        this.router.navigate(['/', 'game']);
    }

    updateTimer(timer: number): void {
        this.timer.next(timer  / 1000000000);
    }
}