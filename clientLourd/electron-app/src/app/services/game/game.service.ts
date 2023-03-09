import { Injectable } from "@angular/core";
import { Game } from "@app/utils/interfaces/game/game";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class GameService {
    game!: Subject<Game>;
    constructor() {
        this.game = new Subject<Game>();
    }

    updateGame(game: Game): void {
        this.game.next(game);
    }
}