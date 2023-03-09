import { Component, HostListener } from "@angular/core";
import { Piece } from "@app/utils/interfaces/piece";
import { MousePlacementService } from "@app/services/mouse-placement/mouse-placement.service";

@Component({
    selector: "app-piece",
    templateUrl: "./piece.component.html",
    styleUrls: ["./piece.component.scss"],
})
export class PieceComponent{
    piece!: Piece;

    constructor(private mousePlacementService: MousePlacementService) { 
        const characters = 'abcdefghijklmnopqrstuvwxyz';
        this.piece = {letter: characters.charAt(Math.floor(Math.random() * characters.length)), value: 0};
    }
}