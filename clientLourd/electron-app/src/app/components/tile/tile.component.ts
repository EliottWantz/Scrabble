import { Component, ElementRef, Input, Renderer2, ViewChild } from "@angular/core";
import { GameService } from "@app/services/game/game.service";
import { MoveService } from "@app/services/game/move.service";
import { MouseService } from "@app/services/mouse/mouse.service";
import { UserService } from "@app/services/user/user.service";
import { Tile } from "@app/utils/interfaces/game/tile";

@Component({
    selector: "app-tile",
    templateUrl: "./tile.component.html",
    styleUrls: ["./tile.component.scss"],
})
export class TileComponent {
    alreadyClicked = false;
    constructor(private mouseService: MouseService, private renderer: Renderer2, private moveService: MoveService,
        private gameService: GameService, private userService: UserService) {}
    @Input() tile!: Tile;
    @Input() disabled = false;
    @ViewChild('elem') element!: ElementRef;

    clicked(): void {
        if (!this.disabled && this.checkIfTurn()) {
            console.log("clicked");
            if (this.alreadyClicked) {
                this.renderer.setStyle(this.element.nativeElement, "outline-color", "#e6d9b7");
                this.alreadyClicked = false;
                const index = this.mouseService.tileElems.indexOf(this.element.nativeElement, 0);
                if (index > -1) {
                    this.mouseService.tileElems.splice(index, 1); 
                }

                const indexMove = this.gameService.selectedTiles.indexOf(this.tile, 0);
                if (indexMove > -1) {
                    this.gameService.selectedTiles.splice(indexMove, 1);
                }
            }
            else {
                this.renderer.setStyle(this.element.nativeElement, "outline-color", "red");
                this.alreadyClicked = true;
                this.mouseService.tileElems.push(this.element.nativeElement);
                this.gameService.selectedTiles.push(this.tile);
                console.log(this.gameService.selectedTiles);
            }
        }
    }

    checkIfTurn(): boolean {
        return this.gameService.scrabbleGame.value?.turn === this.userService.currentUserValue.id;
    }

    getASCII(): string {
        return String.fromCharCode(this.tile.letter);
    }
}