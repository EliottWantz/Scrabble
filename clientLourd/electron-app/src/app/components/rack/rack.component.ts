import { Component, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Game, ScrabbleGame } from "@app/utils/interfaces/game/game";
import { GameService } from "@app/services/game/game.service";
import { UserService } from "@app/services/user/user.service";
import { Tile } from "@app/utils/interfaces/game/tile";
import {CdkDragDrop} from '@angular/cdk/drag-drop'
import { MouseService } from "@app/services/mouse/mouse.service";
import { TileComponent } from "../tile/tile.component";

@Component({
    selector: "app-rack",
    templateUrl: "./rack.component.html",
    styleUrls: ["./rack.component.scss"],
})
export class RackComponent implements OnInit {
    game!: BehaviorSubject<ScrabbleGame>;
    rack: Tile[] = [];
    constructor(private gameService: GameService, private userService: UserService, private mouseService:MouseService) {
        this.game = this.gameService.scrabbleGame;
        const currentRack = this.getPlayerRack();
        if (currentRack)    
            this.rack = currentRack;
        console.log(this.rack);
        console.log(this.userService.subjectUser.value.id);
    }

    ngOnInit(): void {
        this.game.subscribe(() => {
            console.log("game updated");
            const currentRack = this.getPlayerRack();
            if (currentRack)    
                this.rack = currentRack;
        });
    }

    private getPlayerRack(): Tile[] | undefined {
        console.log(this.game.value);
        console.log(this.game.value.players);
        if (this.game.value.players) {
            for (let i = 0; i < this.game.value.players.length; i++) {
                if (this.game.value.players[i].id == this.userService.subjectUser.value.id) {
                    console.log(this.game.value.players[i].rack);
                    return this.game.value.players[i].rack.tiles;
                }   
            }
        }
        
        return undefined;
    }

    drop(event: CdkDragDrop<string[]>) {
        console.log(event);
        console.log(event.dropPoint);
        console.log(document.elementFromPoint(event.dropPoint.x,event.dropPoint.y));
        let x = Number(document.elementFromPoint(event.dropPoint.x, event.dropPoint.y)?.getAttribute("data-x"));
        let y = Number(document.elementFromPoint(event.dropPoint.x, event.dropPoint.y)?.getAttribute("data-y"));
        let elem = event.item.element.nativeElement;
        let tile : Tile = {letter: Number(elem.getAttribute("data-letter")), value: Number(elem.getAttribute("data-value"))};
        console.log(tile);
        this.mouseService.place_drag_drop(elem, x, y, tile);
      }
}