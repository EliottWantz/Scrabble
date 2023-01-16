import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { QuitGameComponent } from '@app/components/quit-game/quit-game.component';
import { GameService } from '@app/services/game/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { WebsocketService } from '@app/services/socket/websocket.service';
import { TimerService } from '@app/services/timer/timer.service';
// import { Objective } from '@common/objectives';
import { Player } from '@common/player';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-panel-informations',
    templateUrl: './panel-informations.component.html',
    styleUrls: ['./panel-informations.component.scss'],
})
export class PanelInformationsComponent implements OnInit {
    lettersInReserve$: Observable<number>;
    allLettersRemaining: string[];
    timer$: Observable<number>;
    gameEnded$: Observable<boolean>;
    player: Player;
    opponent: Player;
    // publicObjectives: Objective[];

    constructor(
        public modal: MatDialog,
        public gameService: GameService,
        public playerService: PlayerService,
        public wsService: WebsocketService,
        private timerService: TimerService,
    ) {
        this.playerService.init();
        this.timer$ = this.timerService.timer$.asObservable();
        this.gameEnded$ = this.gameService.game$.pipe(map((game) => game.hasEnded));
    }
    ngOnInit(): void {
        this.gameService.game$.subscribe((game) => {
            this.allLettersRemaining = game.letterReserve;
            // this.publicObjectives = [] as Objective[];
            // for (let i = 0; i < ((game.publicObjectives as Objective[]).length as number); i++) {
            //     this.publicObjectives.push((game.publicObjectives as Objective[])[i]);
            // }
        });
        this.lettersInReserve$ = this.gameService.game$.pipe(map((game) => game.letterReserve.length));
        this.playerService.player$.subscribe((player) => (this.player = player));
        this.playerService.opponent$.subscribe((player) => (this.opponent = player));
    }

    openQuitDialog(): void {
        this.modal.open(QuitGameComponent);
    }
}
