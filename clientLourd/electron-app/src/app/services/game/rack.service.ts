import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
})
export class RackService {
    placedTiles: HTMLElement[] = []
    
    replaceTilesInRack(): void {
        const rack = document.getElementById("rack");
        if (this.placedTiles.length > 0) {
            for (let tileElem of this.placedTiles) {
                rack?.appendChild(tileElem.children[0]);
            }
        }
    }
}