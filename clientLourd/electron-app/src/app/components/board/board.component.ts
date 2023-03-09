import { Component, HostListener } from "@angular/core";
import {CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragEnter} from '@angular/cdk/drag-drop';
import { Piece } from "@app/utils/interfaces/piece";
import { Square } from "@app/utils/interfaces/square";
import { BehaviorSubject, Observable } from "rxjs";

@Component({
    selector: "app-board",
    templateUrl: "./board.component.html",
    styleUrls: ["./board.component.scss"],
})
export class BoardComponent {
    constructor() {
    }
}