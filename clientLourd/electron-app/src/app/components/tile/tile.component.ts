import { Component, ElementRef, Input, Renderer2, ViewChild } from "@angular/core";
import { MouseService } from "@app/services/mouse/mouse.service";
import { Tile } from "@app/utils/interfaces/game/tile";

@Component({
    selector: "app-tile",
    templateUrl: "./tile.component.html",
    styleUrls: ["./tile.component.scss"],
})
export class TileComponent {
    alreadyClicked = false;
    constructor(private mouseService: MouseService, private renderer: Renderer2) {}
    @Input() tile!: Tile;
    @Input() disabled = false;
    @ViewChild('elem') element!: ElementRef;

    clicked(): void {
        if (!this.disabled) {
            console.log("clicked");
            if (this.alreadyClicked) {
                this.renderer.setStyle(this.element.nativeElement, "outline-color", "#e6d9b7");
                this.alreadyClicked = false;
                this.mouseService.remove(this.tile);
                const index = this.mouseService.tileElems.indexOf(this.element.nativeElement, 0);
                if (index > -1) {
                    this.mouseService.tileElems.splice(index, 1); 
                }
            }
            else {
                this.renderer.setStyle(this.element.nativeElement, "outline-color", "red");
                this.alreadyClicked = true;
                this.mouseService.select(this.tile);
                this.mouseService.tileElems.push(this.element.nativeElement);
            }
        }
    }

    getASCII(): string {
        return String.fromCharCode(this.tile.letter);
    }
}