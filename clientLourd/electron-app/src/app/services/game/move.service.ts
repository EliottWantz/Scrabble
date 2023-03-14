import { Injectable } from "@angular/core";
import { Game } from "@app/utils/interfaces/game/game";
import { BehaviorSubject } from "rxjs";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { PlayMovePayload } from "@app/utils/interfaces/packet";
import { Tile } from "@app/utils/interfaces/game/tile";
import { Cover, MoveInfo } from "@app/utils/interfaces/game/move";
import { GameService } from "@app/services/game/game.service";

@Injectable({
    providedIn: 'root',
})
export class MoveService {
    selectedTiles: Tile[] = [];
    placedTiles: Tile[] = [];
    game!: BehaviorSubject<Game>;
    constructor(private webSocketService: WebSocketService, private gameService: GameService) {
        this.game = this.gameService.game;
        this.game.subscribe(() => {
            this.selectedTiles = [];
            this.placedTiles = [];
        })
    }

    async playTiles(): Promise<void> {
        let letters = "";
        const covers: Cover = {};
        this.placedTiles.forEach(tile => {
            letters += String.fromCharCode(tile.letter);
            covers[tile.y?.toString() + "/" + tile.x?.toString()] = String.fromCharCode(tile.letter);
        });

        const move: MoveInfo = {
            type: "playTile",
            letters: letters,
            covers: covers
        };

        const payload: PlayMovePayload = {
            gameId: this.game.value.id,
            moveInfo: move
        };

        this.webSocketService.send("playMove", payload);
        console.log("Played ");
        console.log(this.placedTiles);
        this.placedTiles = [];
        this.selectedTiles = [];
    }

    exchange(): void {
        let letters = "";
        this.selectedTiles.forEach(tile => {
            letters += String.fromCharCode(tile.letter);
        });

        const move: MoveInfo = {
            type: "exchange",
            letters: letters
        };

        const payload: PlayMovePayload = {
            gameId: this.game.value.id,
            moveInfo: move
        };

        this.webSocketService.send("playMove", payload);
        console.log("Exchanged ");
        console.log(this.selectedTiles);
        this.selectedTiles = [];
        this.placedTiles = [];
    }

    pass(): void {
        const move: MoveInfo = {
            type: "pass"
        };

        const payload: PlayMovePayload = {
            gameId: this.game.value.id,
            moveInfo: move
        };

        this.webSocketService.send("playMove", payload)
        this.selectedTiles = [];
        this.placedTiles = [];
    }

    indice(): void {
        this.webSocketService.send("indice", {gameId: this.game.value.id});
    }
}