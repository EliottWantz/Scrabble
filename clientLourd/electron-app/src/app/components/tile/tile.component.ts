import { Component, HostListener, Input, Output } from "@angular/core";
import { Tile } from "@app/utils/interfaces/game/tile";

@Component({
    selector: "app-tile",
    templateUrl: "./tile.component.html",
    styleUrls: ["./tile.component.scss"],
})
export class TileComponent{
    @Input() tile!: Tile;
}