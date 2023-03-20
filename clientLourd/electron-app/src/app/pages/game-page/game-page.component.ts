import { Component, OnInit } from "@angular/core";
import { GameService } from "@app/services/game/game.service";
import { Game, ScrabbleGame } from "@app/utils/interfaces/game/game";
import { BehaviorSubject } from "rxjs";
import { UserService } from "@app/services/user/user.service";
import { MoveService } from "@app/services/game/move.service";
import { MoveInfo } from "@app/utils/interfaces/game/move";

@Component({
    selector: "app-game-page",
    templateUrl: "./game-page.component.html",
    styleUrls: ["./game-page.component.scss"],
})
export class GamePageComponent implements OnInit {
    game!: BehaviorSubject<ScrabbleGame>;
    moves!: BehaviorSubject<MoveInfo[]>
    constructor(private gameService: GameService, private userService: UserService, private moveService: MoveService) { }

    ngOnInit(): void {
        this.game = this.gameService.scrabbleGame;
        this.game.subscribe();
        this.moves = this.gameService.moves;
    }

    isTurn(): boolean {
        return this.game.value.turn == this.userService.currentUserValue.id;
    }

    hasPlacedLetters(): boolean {
        return this.moveService.placedTiles.length != 0;
    }

    hasSelectedLetters(): boolean {
        return this.moveService.selectedTiles.length != 0;
    }

    submit(): void {
        this.moveService.playTiles();
    }

    pass(): void {
        this.moveService.pass();
    }

    exchange(): void {
        this.moveService.exchange();
    }

    indice(): void {
        this.moveService.indice();
    }

    getIndice(): string[] {
        const strings = [];
        for (const move of this.moves.value) {
            strings.push(JSON.stringify(move));
        }
        return strings;
    }
}