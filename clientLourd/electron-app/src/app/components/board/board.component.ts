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
    clicked(row: number, col: number): void {
        const currentElem = this.elements.toArray()[row * 15 + col];
        if (currentElem.nativeElement.children.length == 0 && this.moveService.selectedTiles.length == 1) {
            this.mouseService.place(currentElem.nativeElement, row, col);
        }
    }
}