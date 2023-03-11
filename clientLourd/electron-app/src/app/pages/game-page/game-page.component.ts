import { Component, OnInit } from "@angular/core";
import { GameService } from "@app/services/game/game.service";
import { Game } from "@app/utils/interfaces/game/game";
import { BehaviorSubject } from "rxjs";
import { UserService } from "@app/services/user/user.service";
import { MoveService } from "@app/services/game/move.service";

@Component({
    selector: "app-game-page",
    templateUrl: "./game-page.component.html",
    styleUrls: ["./game-page.component.scss"],
})
export class GamePageComponent implements OnInit {
    game!: BehaviorSubject<Game>;
    constructor(private gameService: GameService, private userService: UserService, private moveService: MoveService) { }

    ngOnInit(): void {
        this.game = this.gameService.game;
        this.game.subscribe();
    }

    isTurn(): boolean {
        return this.game.value.turn == this.userService.currentUserValue.id;
    }

    hasPlacedLetters(): boolean {
        return this.moveService.placedTiles.length != 0;
    }

    submit(): void {
        this.moveService.playTiles();
    }
}