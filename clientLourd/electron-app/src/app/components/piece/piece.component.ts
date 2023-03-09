import { Component, HostListener } from "@angular/core";
import { Piece } from "@app/utils/interfaces/piece";

@Component({
    selector: "app-piece",
    templateUrl: "./piece.component.html",
    styleUrls: ["./piece.component.scss"],
})
export class PieceComponent{
    piece!: Piece;

    constructor() { 
    }
}