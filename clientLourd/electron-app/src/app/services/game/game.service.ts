import { Injectable } from "@angular/core";
import { BoardHelper } from "@app/classes/board-helper";
import { Game } from "@app/utils/interfaces/game/game";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class GameService {
    game!: BehaviorSubject<Game>;
    timer!: BehaviorSubject<number>;
    constructor() {
        this.game = new BehaviorSubject<Game>({
            id: "",
            players: [],
            board: BoardHelper.createBoard(),
            finished: false,
            numPassMoves: 0,
            turn: "ba9f559f-e42b-45df-88bd-a7b3cc3c8cc3",
            timer: 120,
        });
        
        this.timer = new BehaviorSubject<number>(120);
    }

    updateGame(game: Game): void {
        this.game.next(game);
        this.timer.next(game.timer);
    }

    updateTimer(timer: number): void {
        this.timer.next(timer);
    }
}