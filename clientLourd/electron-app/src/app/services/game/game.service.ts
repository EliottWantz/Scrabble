import { Injectable } from "@angular/core";
import { BoardHelper } from "@app/classes/board-helper";
import { Game } from "@app/utils/interfaces/game/game";
import { Square } from "@app/utils/interfaces/square";
import { BehaviorSubject } from "rxjs";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { Packet } from "@app/utils/interfaces/packet";

@Injectable({
    providedIn: 'root',
})
export class GameService {
    board!: BehaviorSubject<Square[][]>;
    game!: Game;
    constructor(private webSocketService: WebSocketService) {
        this.board = new BehaviorSubject<Square[][]>(BoardHelper.createBoard());
    }

    playTiles(letters: string): void {
        const payload: Packet
        this.webSocketService.send()
    }
}