import { Component, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ScrabbleGame } from "@app/utils/interfaces/game/game";
import { GameService } from "@app/services/game/game.service";
import { UserService } from "@app/services/user/user.service";
import { Tile } from "@app/utils/interfaces/game/tile";
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import { MouseService } from "@app/services/mouse/mouse.service";
import { Player } from "@app/utils/interfaces/game/player";

@Component({
    selector: "app-rack",
    templateUrl: "./rack.component.html",
    styleUrls: ["./rack.component.scss"],
})
export class RackComponent implements OnInit {
    game!: BehaviorSubject<ScrabbleGame | undefined>;
    rack: Tile[] = [];
    constructor(private gameService: GameService, private userService: UserService, private mouseService:MouseService) {
        this.game = this.gameService.scrabbleGame;
        const currentRack = this.getPlayerRack();
        if (currentRack)    
            this.rack = currentRack;
    }

    ngOnInit(): void {
        this.game.subscribe(() => {
            const currentRack = this.getPlayerRack();
            if (currentRack)    
                this.rack = currentRack;
        });
    }

    checkIfTurn(): boolean {
        return this.game.value?.turn === this.userService.currentUserValue.id;
    }

    private getPlayerRack(): Tile[] | undefined {
        if (this.game.value?.players) {
            for (let i = 0; i < this.game.value.players.length; i++) {
                if (this.game.value.players[i].id == this.userService.subjectUser.value.id) {
                    return this.game.value.players[i].rack.tiles;
                }   
            }
        }
        
        return undefined;
    }

    drop(event: CdkDragDrop<string[]>) {
        let bruh = document.elementFromPoint(event.dropPoint.x, event.dropPoint.y);
        if (document.getElementById("board")?.contains(bruh) == false) {
            return;
        }
        if (this.gameService.dragging.value === false) {
            this.gameService.resetSelectedAndPlaced();
        }
        setTimeout(() => {
            this.gameService.dragging.next(true);
            while (bruh && bruh?.tagName !== "MAT-GRID-TILE") {
                bruh = bruh.parentElement;
            }
            if (bruh?.classList.contains("bad")) {
                return;
            }
            const x = Number(bruh?.getAttribute("data-x"));
            const y = Number(bruh?.getAttribute("data-y"));
            if (this.gameService.scrabbleGame.value?.board[x][y].tile?.letter) {
                return;
            }
            const elem = event.item.element.nativeElement;
            const tile : Tile = {letter: Number(elem.getAttribute("data-letter")), value: Number(elem.getAttribute("data-value"))};
            this.gameService.selectedTiles = [];
            this.mouseService.resetColor();
            if (this.gameService.scrabbleGame.value) {
                const newPlayers: Player[] = this.gameService.scrabbleGame.value.players;
                for (let i = 0; i < newPlayers.length; i++) {
                    if (this.userService.currentUserValue.id === newPlayers[i].id) {
                        for (let j = 0; j < newPlayers[i].rack.tiles.length; j++) {
                            if (newPlayers[i].rack.tiles[j].letter == tile.letter) {
                                newPlayers[i].rack.tiles.splice(j, 1);
                                this.gameService.scrabbleGame.next({...this.gameService.scrabbleGame.value, players: newPlayers});
                                this.mouseService.place_drag_drop(x, y, tile);
                                return;
                            }
                        }
                    }
                }
            }
        }, 100); 
      }
}