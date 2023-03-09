import { Component, HostListener } from "@angular/core";
import {CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragEnter} from '@angular/cdk/drag-drop';
import { Piece } from "@app/utils/interfaces/piece";
import { Square } from "@app/utils/interfaces/square";
import { BoardService } from "@app/services/board/board.service";
import { BehaviorSubject, Observable } from "rxjs";
import { MousePlacementService } from "@app/services/mouse-placement/mouse-placement.service";

@Component({
    selector: "app-board",
    templateUrl: "./board.component.html",
    styleUrls: ["./board.component.scss"],
})
export class BoardComponent {
    grid!: BehaviorSubject<Square[][]>;
    constructor(private boardService: BoardService, private mousePlacementService: MousePlacementService) {
        this.grid = this.boardService.grid;
        this.grid.subscribe();
    }

    placeLetter(x: number, y: number): void {
        const squares = document.body.getElementsByClassName("square");

        const letter = this.mousePlacementService.placeLetter();

        document.body.getElementsByClassName("square")[15 * y + x].innerHTML = JSON.stringify(letter);
    }
}