import { Component, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Game, ScrabbleGame } from "@app/utils/interfaces/game/game";
import { GameService } from "@app/services/game/game.service";
import { UserService } from "@app/services/user/user.service";
import { Tile } from "@app/utils/interfaces/game/tile";
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import { MouseService } from "@app/services/mouse/mouse.service";
import { TileComponent } from "../tile/tile.component";
import { MoveService } from "@app/services/game/move.service";

@Component({
    selector: "app-rack",
    templateUrl: "./rack.component.html",
    styleUrls: ["./rack.component.scss"],
})
export class RackComponent implements OnInit {
    game!: BehaviorSubject<ScrabbleGame | undefined>;
    rack: Tile[] = [];
    constructor(private gameService: GameService, private userService: UserService, private mouseService:MouseService,
        private moveService: MoveService) {
        this.game = this.gameService.scrabbleGame;
        const currentRack = this.getPlayerRack();
        if (currentRack)    
            this.rack = currentRack;
        //console.log(this.rack);
        //console.log(this.userService.subjectUser.value.id);
    }

    ngOnInit(): void {
        this.game.subscribe(() => {
            //console.log("game updated");
            const currentRack = this.getPlayerRack();
            if (currentRack)    
                this.rack = currentRack;
        });
    }

    checkIfTurn(): boolean {
        return this.game.value?.turn === this.userService.currentUserValue.id;
    }

    private getPlayerRack(): Tile[] | undefined {
        //console.log(this.game.value);
        //console.log(this.game.value?.players);
        if (this.game.value?.players) {
            for (let i = 0; i < this.game.value.players.length; i++) {
                if (this.game.value.players[i].id == this.userService.subjectUser.value.id) {
                    //console.log(this.game.value.players[i].rack);
                    return this.game.value.players[i].rack.tiles;
                }   
            }
        }
        
        return undefined;
    }

    drop(event: CdkDragDrop<string[]>) {
        console.log(event);
        console.log(event.dropPoint);
        console.log(event.previousContainer);
        console.log(document.elementFromPoint(event.dropPoint.x,event.dropPoint.y));
        let bruh = document.elementFromPoint(event.dropPoint.x, event.dropPoint.y);
        if (document.getElementById("board")?.contains(bruh) == false) {
            return;
        }
        
        console.log(bruh);
        while (bruh && bruh?.tagName !== "MAT-GRID-TILE") {
            bruh = bruh.parentElement;
        }
        if (bruh?.classList.contains("bad")) {
            console.log("bad");
            return;
        }
        console.log(bruh);
        const x = Number(bruh?.getAttribute("data-x"));
        const y = Number(bruh?.getAttribute("data-y"));
        console.log(x);
        console.log(y);
        if (this.gameService.scrabbleGame.value?.board[x][y].tile?.letter) {
            return;
          }
        const elem = event.item.element.nativeElement;
        const tile : Tile = {letter: Number(elem.getAttribute("data-letter")), value: Number(elem.getAttribute("data-value"))};
        console.log(tile);
        this.gameService.selectedTiles = [];
        this.mouseService.resetColor();
        let deleted = false;
        for (let i = 0; i < this.rack.length; i++) {
            if (this.rack[i].letter == tile.letter && !deleted) {
                this.rack.splice(i, 1);
                deleted = true;
            }
        }
        /*const index = this.moveService.placedTiles.indexOf(tile, 0);
        if (index > -1) {
            const newBoard = this.gameService.scrabbleGame.value?.board;
            if (this.gameService.scrabbleGame.value && newBoard) {
                newBoard[Number(elem.getAttribute("data-y"))][Number(elem.getAttribute("data-x"))].tile = undefined;
                this.gameService.scrabbleGame.next({...this.gameService.scrabbleGame.value, board: newBoard});
            }
        }*/
        this.mouseService.place_drag_drop(elem, x, y, tile);
      }
}