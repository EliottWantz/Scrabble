import { Component, ElementRef, HostListener, Input, Output, ViewChild } from "@angular/core";
import { MouseService } from "@app/services/mouse/mouse.service";
import { Tile } from "@app/utils/interfaces/game/tile";

@Component({
    selector: "app-tile",
    templateUrl: "./tile.component.html",
    styleUrls: ["./tile.component.scss"],
})
export class TileComponent {
    constructor(private mouseService: MouseService) {}
    @Input() tile!: Tile;
    @Input() disabled: boolean = false;
    @ViewChild('elem') element!: ElementRef;

    clicked(): void {
        if (!this.disabled) {
            this.mouseService.tileElem = this.element.nativeElement;
            this.mouseService.tile = this.tile;
        }
    }
}