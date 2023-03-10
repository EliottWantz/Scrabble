import { Component, ElementRef, HostListener, Input, Output, ViewChild } from "@angular/core";
import { MouseService } from "@app/services/mouse/mouse.service";
import { Tile } from "@app/utils/interfaces/game/tile";

@Component({
    selector: "app-tile",
    templateUrl: "./tile.component.html",
    styleUrls: ["./tile.component.scss"],
})
export class TileComponent{
    constructor(private mouseService: MouseService) {}
    @Input() tile!: Tile;
    @ViewChild('elem') element!: ElementRef;

    clicked(): void {
        if (this.element.nativeElement.getAttribute('id') != "disabled") {
            this.mouseService.tileElem = this.element.nativeElement;
        }
    }
}