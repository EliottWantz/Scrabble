import { Injectable } from "@angular/core";
import { BoardHelper } from "@app/classes/board-helper";
import { Game } from "@app/utils/interfaces/game/game";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class GameService {
    game!: BehaviorSubject<Game>;
    constructor() {
        this.game = new BehaviorSubject<Game>({
            id: "",
            players: [
                {
                    id: "ba9f559f-e42b-45df-88bd-a7b3cc3c8cc3",
                    username: "Olivier",
                    rack: [
                        {
                            letter: "a",
                            value: 1
                        },
                        {
                            letter: "e",
                            value: 1
                        } 
                    ],
                    score: 0,
                    consecutiveExchanges: 0,
                    isBot: false
                }
            ],
            board: BoardHelper.createBoard(),
            bag: [],
            finished: false,
            numPassMoves: 0,
            turn: "ba9f559f-e42b-45df-88bd-a7b3cc3c8cc3"
        });
    }

    updateGame(game: Game): void {
        this.game.next(game);
    }
}