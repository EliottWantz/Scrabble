import { Injectable } from "@angular/core";
import { BoardHelper } from "@app/classes/board-helper";
import { Game } from "@app/utils/interfaces/game/game";
import { Square } from "@app/utils/interfaces/square";
import { BehaviorSubject } from "rxjs";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { ClientPayload, Packet, PlayMovePayload } from "@app/utils/interfaces/packet";
import { Tile } from "@app/utils/interfaces/game/tile";
import { MoveInfo } from "@app/utils/interfaces/game/move";
import { RoomService } from "@app/services/room/room.service";
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
    }

    async playTiles(): Promise<void> {
        let letters: string = "";
        const covers = new Map();
        this.placedTiles.forEach(tile => {
            letters += tile.letter;
            covers.set(tile.x?.toString() + "/" + tile.y?.toString(), tile.letter);
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
    }

    exchange(): void {
        let letters: string = "";
        this.selectedTiles.forEach(tile => {
            letters += tile.letter;
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
    }
}