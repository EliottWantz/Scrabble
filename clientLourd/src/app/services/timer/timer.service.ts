import { Injectable } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
import { WebsocketService } from '@app/services/socket/websocket.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    timer$: BehaviorSubject<number>;
    constructor(private wsService: WebsocketService, private gameService: GameService) {}

    init(): void {
        this.timer$ = new BehaviorSubject(this.gameService.game$.getValue().timer);
        this.wsService.socket.on('updateTimer', (timer) => {
            this.timer$.next(timer);
        });
    }
}
