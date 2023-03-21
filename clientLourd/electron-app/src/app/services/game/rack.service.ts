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
                tileElem.children[0].className = "recycled";
                rack?.appendChild(tileElem.children[0]);
            }
        }
    }

    deleteRecycled(): void {
        const recycled = document.getElementsByClassName("recycled");
        if (recycled) {
            for (let i = 0; i < recycled.length; i++) {
                recycled[i].remove();
            }
        }
    }
}