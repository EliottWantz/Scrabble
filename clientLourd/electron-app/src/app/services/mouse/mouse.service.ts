import { Injectable } from "@angular/core";
import { Tile } from "@app/utils/interfaces/game/tile";
import { MoveService } from "@app/services/game/move.service";
import { RackService } from "@app/services/game/rack.service";

@Injectable({
    providedIn: 'root',
})
export class MouseService {
    tileElems: HTMLElement[] = [];
    constructor(private moveService: MoveService, private rackService: RackService) {}

    place(element: HTMLElement, row: number, col: number): void {
        if (this.tileElems.length == 1 && this.moveService.selectedTiles.length == 1) {
            console.log("hello");
            element.appendChild(this.tileElems[0]);
            this.rackService.placedTiles.push(element);
            this.tileElems[0].style.outlineColor = "black";
            this.tileElems = [];
            
            const indexMove = this.moveService.placedTiles.indexOf(this.moveService.selectedTiles[0], 0);
            if (indexMove > -1) {
                this.moveService.selectedTiles[0] = {...this.moveService.selectedTiles[0], x: col, y: row};
                this.moveService.placedTiles[indexMove] = {...this.moveService.selectedTiles[0], x: col, y: row};
            } else {
                this.moveService.placedTiles.push({...this.moveService.selectedTiles[0], x: col, y: row});
            }

            this.moveService.selectedTiles.splice(0, 1);
            console.log(this.moveService.placedTiles);
            console.log(this.moveService.selectedTiles);
        }
    }

    select(tile: Tile): void {
        this.moveService.selectedTiles.push(tile);
        console.log(this.moveService.selectedTiles);
    }

    remove(tile: Tile): void {
        const index = this.moveService.selectedTiles.indexOf(tile, 0);
        if (index > -1)
            this.moveService.selectedTiles.splice(index, 1);
    }
}