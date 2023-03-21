import { Component, ElementRef, OnInit, ViewChildren, QueryList } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Game, ScrabbleGame } from "@app/utils/interfaces/game/game";
import { GameService } from "@app/services/game/game.service";
import { MouseService } from "@app/services/mouse/mouse.service";
import { MoveService } from "@app/services/game/move.service";

@Component({
    selector: "app-board",
    templateUrl: "./board.component.html",
    styleUrls: ["./board.component.scss"],
})
export class BoardComponent implements OnInit {
    game!: BehaviorSubject<ScrabbleGame>;
    constructor(private gameService: GameService, private mouseService: MouseService, private moveService: MoveService) {
        this.game = this.gameService.scrabbleGame;
    }

    ngOnInit(): void {
        this.game.subscribe(() => {
            console.log("game updated");
        });
    }

    @ViewChildren('elem') elements!: QueryList<ElementRef>;
    @ViewChildren('multis') multis!: QueryList<ElementRef>;
    clicked(row: number, col: number): void {
        console.log("allo");
        const currentElem = this.elements.toArray()[row * 15 + col];
        const multiElem = this.multis.toArray()[row * 15 + col];
        if (currentElem.nativeElement.children.length == 1 && this.moveService.selectedTiles.length == 1) {
            this.mouseService.place(currentElem.nativeElement, row, col);
            console.log("allo");
            multiElem.nativeElement.remove();
        }
    }

    getTextSquare(wordMultiplier: number, letterMultiplier: number): string {
        if (wordMultiplier == 2) {
            return "DW";
        } else if (wordMultiplier == 3) {
            return "TW";
        } else if (letterMultiplier == 2) {
            return "DL";
        } else if (letterMultiplier == 3) {
            return "TL";
        }
        return "";
    }
}