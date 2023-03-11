import { Injectable } from "@angular/core";
import { Tile } from "@app/utils/interfaces/game/tile";
import { MoveService } from "@app/services/game/move.service";

@Injectable({
    providedIn: 'root',
})
export class MouseService {
    tileElem: HTMLElement | undefined;
    tile: Tile | undefined;

    constructor(private moveService: MoveService) {}

    place(element: HTMLElement): void {
        if (this.tileElem && this.tile) {
            element.appendChild(this.tileElem);
            this.tileElem = undefined;
            this.moveService.placedTiles.push(this.tile);
            this.tile = undefined;
        }
    }
}