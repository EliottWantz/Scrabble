import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
//import { PlayerAbandonedComponent } from '@app/components/player-abandoned/player-abandoned.component';
import { QuitGameComponent } from '@app/components/quit-game/quit-game.component';
//import { WinGameComponent } from '@app/components/win-game/win-game.component';
//import { ChatService } from '@app/services/chat/chat.service';
import { EaselService } from '@app/services/easel/easel.service';
import { EventBusService } from '@app/services/events/event-bus.service';
import { GameService } from '@app/services/game/game.service';
import { MousePlacementService } from '@app/services/mouse-placement/mouse-placement.service';
import { PlayerService } from '@app/services/player/player.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Player } from '@common/player';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements OnInit {
    lettersInReserve$: Observable<number>;
    allLettersRemaining: string[];
    timer$: Observable<number>;
    gameEnded: boolean;
    player: Player;
    opponent: Player;
    constructor(
        public modal: MatDialog,
        public gameService: GameService,
        public playerService: PlayerService,
        public mousePlacementService: MousePlacementService,
        //private chatService: ChatService,
        private eventBus: EventBusService,
        private timerService: TimerService,
        public easelService: EaselService,
    ) {
        this.gameService.game$.subscribe((game) => {
            this.allLettersRemaining = game.letterReserve;
            this.gameEnded = game.hasEnded;
        });
        // this.gameService.wsService.socket.on('playerAbandoned', () => this.openPlayerAbandonedDialog());
        this.playerService.init();
        this.mousePlacementService.init();
        this.timerService.init();
        this.timer$ = this.timerService.timer$.asObservable();
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        if (this.gameEnded) return;
        if (!this.mousePlacementService.isBoardFocused) {
            return this.eventBus.emit('keyPressed', event.key);
        }
        switch (event.key) {
            case 'Backspace': {
                this.mousePlacementService.cancelPreviousPlacement();
                break;
            }
            case 'Escape': {
                this.mousePlacementService.cancelPlacement();
                break;
            }
            case 'Enter': {
                this.mousePlacementService.confirmPlacement();
                break;
            }
            default:
                this.mousePlacementService.addLetter(event.key);
        }
    }

    @HostListener('wheel', ['$event'])
    emitMouseWheelEvent(event: WheelEvent) {
        this.eventBus.emit('mouseWheel', event.deltaY);
    }

    ngOnInit(): void {
        this.lettersInReserve$ = this.gameService.game$.pipe(map((game) => game.letterReserve.length));
        this.playerService.player$.subscribe((player) => (this.player = player));
        this.playerService.opponent$.subscribe((player) => (this.opponent = player));
        // this.gameService.wsService.socket.on('endOfGame', () => {
            // const endGameMessage: string = ''.concat(
                // 'Fin de partie - ',
                // this.allLettersRemaining.join(''),
                // '\n',
                // this.player.name,
                // ':',
                // this.player.easel.map((l) => l.character).join(''),
                // '\n',
                // this.opponent.name,
                // ':',
                // this.opponent.easel.map((l) => l.character).join(''),
            // );
            // this.chatService.addSystemMessage(endGameMessage);
            // this.openEndGameDialog();
        // });
    }

    openQuitDialog(): void {
        this.modal.open(QuitGameComponent, { disableClose: true });
    }

    skipTurn(): void {
        this.mousePlacementService.cancelPlacement();
        this.gameService.wsService.sendCommand({ fullCommand: '!passer', name: 'passer' });
    }

    /*private openEndGameDialog(): void {
        this.modal.open(WinGameComponent);
    }*/

    /*private openPlayerAbandonedDialog(): void {
        this.modal.open(PlayerAbandonedComponent);
    }*/
}
