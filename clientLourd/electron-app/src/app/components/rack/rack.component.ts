import { Component, HostListener, OnInit } from "@angular/core";
import {CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragEnter} from '@angular/cdk/drag-drop';
import { Square } from "@app/utils/interfaces/square";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { Game } from "@app/utils/interfaces/game/game";
import { GameService } from "@app/services/game/game.service";
import { UserService } from "@app/services/user/user.service";
import { Tile } from "@app/utils/interfaces/game/tile";

@Component({
    selector: "app-rack",
    templateUrl: "./rack.component.html",
    styleUrls: ["./rack.component.scss"],
})
export class RackComponent implements OnInit {
    game!: BehaviorSubject<Game>;
    rack!: Tile[];
    constructor(private gameService: GameService, private userService: UserService) {
        this.game = this.gameService.game;
        const currentRack = this.getPlayerRack();
        if (currentRack)    
            this.rack = currentRack;

        console.log(this.rack);
        console.log(this.userService.subjectUser.value.id);
    }

    ngOnInit(): void {
        this.game.subscribe(() => {
            console.log("game updated");
        });
        for (let i = 0; i < this.rack.length; i++) {
            this.rack[i].letter
        }
    }

    private getPlayerRack(): Tile[] | undefined {
        for (let i = 0; i < this.game.value.players.length; i++) {
            if (this.game.value.players[i].id == this.userService.subjectUser.value.id) {
                console.log(this.game.value.players[i].rack);
                return this.game.value.players[i].rack;
            }   
        }
        return undefined;
    }
}