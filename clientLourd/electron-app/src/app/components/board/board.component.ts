import { Component, HostListener, OnInit } from "@angular/core";
import {CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragEnter} from '@angular/cdk/drag-drop';
import { Square } from "@app/utils/interfaces/square";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { Game } from "@app/utils/interfaces/game/game";
import { GameService } from "@app/services/game/game.service";

@Component({
    selector: "app-board",
    templateUrl: "./board.component.html",
    styleUrls: ["./board.component.scss"],
})
export class BoardComponent implements OnInit {
    game!: BehaviorSubject<Game>;
    constructor(private gameService: GameService) {
        this.game = this.gameService.game;
    }

    ngOnInit(): void {
        this.game.subscribe(() => {
            console.log("game updated");
        });
    }
}