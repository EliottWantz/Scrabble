import { Injectable } from "@angular/core";
import { Tile } from "@app/utils/interfaces/game/tile";

@Injectable({
    providedIn: 'root',
})
export class MouseService {
    tileElem: HTMLElement | undefined;

    constructor() {}

    place(element: HTMLElement): void {
        if (this.tileElem) {
            element.appendChild(this.tileElem);
            this.tileElem.setAttribute("id", "disabled");
            this.tileElem = undefined;
        }
    }
}