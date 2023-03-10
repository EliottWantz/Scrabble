import { Component, ElementRef, HostListener, Input, OnInit, ViewChild, ViewChildren, QueryList } from "@angular/core";
import {CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragEnter} from '@angular/cdk/drag-drop';
import { Square } from "@app/utils/interfaces/square";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { Game } from "@app/utils/interfaces/game/game";
import { GameService } from "@app/services/game/game.service";
import { MouseService } from "@app/services/mouse/mouse.service";

@Component({
    selector: "app-board",
    templateUrl: "./board.component.html",
    styleUrls: ["./board.component.scss"],
})
export class BoardComponent implements OnInit {
    game!: BehaviorSubject<Game>;
    constructor(private gameService: GameService, private mouseService: MouseService) {
        this.game = this.gameService.game;
    }

    ngOnInit(): void {
        this.game.subscribe(() => {
            console.log("game updated");
        });
    }

    @ViewChildren('elem') elements!: QueryList<ElementRef>;
    clicked(row: number, col: number): void {;
        const currentElem = this.elements.toArray()[row * 15 + col];
        if (currentElem.nativeElement.children.length == 0) {
            this.mouseService.place(currentElem.nativeElement);
        }
    }
}