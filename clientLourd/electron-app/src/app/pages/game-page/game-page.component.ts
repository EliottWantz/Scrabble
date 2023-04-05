import { Component, OnInit } from "@angular/core";
import { GameService } from "@app/services/game/game.service";
import { Game, ScrabbleGame } from "@app/utils/interfaces/game/game";
import { BehaviorSubject } from "rxjs";
import { UserService } from "@app/services/user/user.service";
import { MoveService } from "@app/services/game/move.service";
import { MoveInfo } from "@app/utils/interfaces/game/move";
import { StorageService } from "@app/services/storage/storage.service";
import { LeaveGamePayload } from "@app/utils/interfaces/packet";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { Router } from "@angular/router";
import { ThemeService } from "@app/services/theme/theme.service";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { AdviceComponent } from "@app/components/advice/advice.component";

@Component({
    selector: "app-game-page",
    templateUrl: "./game-page.component.html",
    styleUrls: ["./game-page.component.scss"],
})
export class GamePageComponent implements OnInit {
    game!: BehaviorSubject<ScrabbleGame | undefined>;
    //moves!: BehaviorSubject<MoveInfo[]>
    private darkThemeIcon = 'wb_sunny';
    private lightThemeIcon = 'nightlight_round';
    public lightDarkToggleIcon = this.lightThemeIcon;
    language: BehaviorSubject<string>;
    
    constructor(private gameService: GameService, private userService: UserService, private moveService: MoveService, private storageService: StorageService,
        private socketService: WebSocketService, private router: Router, private themeService: ThemeService) {
            this.language = this.themeService.language;
        }

    ngOnInit(): void {
        this.game = this.gameService.scrabbleGame;
        this.game.subscribe();
        //this.moves = this.gameService.moves;
        this.themeService.theme.subscribe((theme) => {
            if (theme == 'dark') {
              this.lightDarkToggleIcon = this.darkThemeIcon;
            } else {
              this.lightDarkToggleIcon = this.lightThemeIcon;
            }
        });
    }

    isTurn(): boolean {
        return this.game.value?.turn == this.userService.currentUserValue.id;
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

    getPlayerAvatar(id: string): string {
        const avatar = this.storageService.getAvatar(id);
        if (avatar != undefined)
            return avatar;
        return "";
    }

    leaveGame(): void {
        if (this.game.value) {
            const payload: LeaveGamePayload = {
                gameId: this.game.value?.id
            };
            this.socketService.send("leave-game", payload);
            this.gameService.game.next(undefined);
            this.gameService.scrabbleGame.next(undefined);
            this.router.navigate(["/home"]);
        }
    }

    public doToggleLightDark() {
        this.themeService.switchTheme();
      }
    
      switchLanguage() {
        this.themeService.switchLanguage();
      }

    /*getIndice(): string[] {
        const strings = [];
        for (const move of this.moves.value) {
            strings.push(JSON.stringify(move));
        }
        return strings;
    }*/
}