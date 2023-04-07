import { Injectable } from "@angular/core";
import { Game, ScrabbleGame } from "@app/utils/interfaces/game/game";
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
    game!: BehaviorSubject<ScrabbleGame | undefined>;
    constructor(private webSocketService: WebSocketService, private gameService: GameService) {
        this.game = this.gameService.scrabbleGame;
    }

    async playTiles(): Promise<void> {
        let letters = "";
        const covers: Cover = {};
        if (this.gameService.scrabbleGame.value) {
            for (let i = 0; i < this.gameService.scrabbleGame.value.board.length; i++) {
                for (let j = 0; j < this.gameService.scrabbleGame.value.board[i].length; j++) {
                    if (this.gameService.scrabbleGame.value.board[i][j].tile 
                        && !this.gameService.scrabbleGame.value.board[i][j].tile?.disabled 
                        && this.gameService.scrabbleGame.value.board[i][j].tile?.y 
                        && this.gameService.scrabbleGame.value.board[i][j].tile?.x
                        && this.gameService.scrabbleGame.value.board[i][j].tile?.letter) {
                        letters += String.fromCharCode((this.gameService.scrabbleGame.value.board[i][j].tile as Tile).letter);
                        covers[((this.gameService.scrabbleGame.value.board[i][j].tile as Tile).y as number).toString() + "/" + ((this.gameService.scrabbleGame.value.board[i][j].tile as Tile).x as number)?.toString()] = String.fromCharCode(((this.gameService.scrabbleGame.value.board[i][j].tile as Tile).letter));
                    }
                }
            }
        }

        const move: MoveInfo = {
            type: "playTile",
            letters: letters,
            covers: covers
        };

        if (this.game.value) {
            const payload: PlayMovePayload = {
                gameId: this.game.value.id,
                moveInfo: move
            };
            this.webSocketService.send("playMove", payload);
            //console.log("Played ");
            console.log(this.gameService.placedTiles);
            this.gameService.resetSelectedAndPlaced();
        }
    }

    exchange(): void {
        let letters = "";
        this.gameService.selectedTiles.forEach(tile => {
            letters += String.fromCharCode(tile.letter);
        });

        const move: MoveInfo = {
            type: "exchange",
            letters: letters
        };

        if (this.game.value) {
            const payload: PlayMovePayload = {
                gameId: this.game.value.id,
                moveInfo: move
            };
    
            this.webSocketService.send("playMove", payload);
            console.log("Exchanged ");
            console.log(this.gameService.selectedTiles);
            this.gameService.resetSelectedAndPlaced();
        }
    }

    pass(): void {
        const move: MoveInfo = {
            type: "pass"
        };

        if (this.game.value) {
            const payload: PlayMovePayload = {
                gameId: this.game.value.id,
                moveInfo: move
            };
    
            this.webSocketService.send("playMove", payload)
            this.gameService.resetSelectedAndPlaced();
        }
    }

    indice(): void {
        if (this.game.value)
            this.webSocketService.send("indice", {gameId: this.game.value.id});
    }
}