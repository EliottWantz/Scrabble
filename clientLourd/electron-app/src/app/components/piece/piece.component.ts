import { Component } from "@angular/core";
import { CdkDragDrop } from "@angular/cdk/drag-drop";

@Component({
    selector: "app-piece",
    templateUrl: "./piece.component.html",
    styleUrls: ["./piece.component.scss"],
})
export class PieceComponent {
    letter!: string;
    value!: number;
    constructor() { 
        const characters = 'abcdefghijklmnopqrstuvwxyz';
        this.letter = characters.charAt(Math.floor(Math.random() * characters.length));
    }
}