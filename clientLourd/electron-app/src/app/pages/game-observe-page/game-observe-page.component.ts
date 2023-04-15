import { Component, OnInit } from "@angular/core";
import { GameService } from "@app/services/game/game.service";
import { Game, ScrabbleGame } from "@app/utils/interfaces/game/game";
import { BehaviorSubject } from "rxjs";
import { UserService } from "@app/services/user/user.service";
import { MoveService } from "@app/services/game/move.service";
import { MoveInfo } from "@app/utils/interfaces/game/move";
import { StorageService } from "@app/services/storage/storage.service";
import { JoinGameAsObserverPayload, LeaveGamePayload, LeaveTournamentAsObserverPayload, ReplaceBotByObserverPayload } from "@app/utils/interfaces/packet";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { Router } from "@angular/router";
import { ThemeService } from "@app/services/theme/theme.service";
import { Rack } from "@app/utils/interfaces/game/rack";
import { Tile } from "@app/utils/interfaces/game/tile";
import { ClientEvent } from "@app/utils/events/client-events";

@Component({
    selector: "app-game-observe-page",
    templateUrl: "./game-observe-page.component.html",
    styleUrls: ["./game-observe-page.component.scss"],
})
export class GameObservePageComponent implements OnInit {
    game!: BehaviorSubject<ScrabbleGame | undefined>;
    //moves!: BehaviorSubject<MoveInfo[]>
    private darkThemeIcon = 'wb_sunny';
    private lightThemeIcon = 'nightlight_round';
    public lightDarkToggleIcon = this.lightThemeIcon;
    language: BehaviorSubject<string>;
    racks: Rack[] = [];
    currentRack = 0;
    isOver = false;
    
    constructor(private gameService: GameService, private userService: UserService, private moveService: MoveService, private storageService: StorageService,
        private socketService: WebSocketService, private router: Router, private themeService: ThemeService) {
            this.language = this.themeService.language;
        }

    ngOnInit(): void {
        this.game = this.gameService.scrabbleGame;
        this.game.subscribe((game) => {
            if (game) {
                this.racks = [];
                for (const player of game.players) {
                    this.racks.push(player.rack);
                }
            }
        });
        //this.moves = this.gameService.moves;
        this.themeService.theme.subscribe((theme) => {
            if (theme == 'dark') {
              this.lightDarkToggleIcon = this.darkThemeIcon;
            } else {
              this.lightDarkToggleIcon = this.lightThemeIcon;
            }
        });
        this.gameService.tournament.subscribe((tournament) => {
            if(tournament?.games[0].id===this.gameService.game.value?.id)
            {
                if(tournament?.games[0].winnerId){
                    this.isOver = true;
                    console.log("bruh");
                }
            }
            else{
                if(tournament?.games[1].winnerId){
                    this.isOver = true;
                    console.log("bruh");
                }
            }
        })
    }

    getPlayerAvatar(id: string): string {
        const avatar = this.storageService.getAvatar(id);
        if (avatar != undefined)
            return avatar;
        return "";
    }
    
    leave(): void {
        if (this.gameService.tournament.value) {
            this.leaveTournament();
        }
        else{
            this.leaveGame();
        }
    }

    leaveGame(): void {
        if (this.game.value) {
            const payload: LeaveGamePayload = {
                gameId: this.game.value?.id
            };
            this.socketService.send("leave-game-as-observateur", payload);
            this.gameService.game.next(undefined);
            this.gameService.scrabbleGame.next(undefined);
            this.router.navigate(["/home"]);
        }
    }

    joinOtherGameAsObserver(): void {
        const payload: JoinGameAsObserverPayload = {
            gameId: this.gameService.tournament.value?.games.splice(this.gameService.tournament.value?.games.indexOf(this.gameService.game.value as Game), 1)[0].id as string,
            password: ""
        }
        this.socketService.send("join-game-as-observateur", payload);
        this.gameService.isObserving = true;
        this.router.navigate(["/gameObserve"]);
    }

    leaveTournament(): void {
        if(this.gameService.tournament.value){
            const payload: LeaveTournamentAsObserverPayload = {
                tournamentId: this.gameService.tournament.value?.id
            };
            this.socketService.send("leave-tournament-as-observateur", payload);
            this.gameService.game.next(undefined);
            this.gameService.tournament.next(undefined);
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

      getASCII(tile: Tile): string {
        return String.fromCharCode(tile.letter);
    }

    switchRack(index: number) {
        this.currentRack = index;
    }

    takePlace(): void {
        if (this.game.value) {
            this.gameService.isObserving = false;
            const payload: ReplaceBotByObserverPayload = {
                gameId: this.game.value.id
            };
            this.socketService.send("replace-bot-by-observer", payload);
            this.router.navigate(["/game"]);
        }
    }

    isDarkTheme(): boolean {
        return this.themeService.theme.value == "dark";
    }

    getTileCount(): number {
        if (this.game.value)
            return this.game.value.tileCount;
        return 0;
    }
}