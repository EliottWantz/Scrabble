import { Injectable } from '@angular/core';
import { EventBusService } from '@app/services/events/event-bus.service';
import { GameService } from '@app/services/game/game.service';
import { WebsocketService } from '@app/services/socket/websocket.service';
import { Letter } from '@common/grid/node';
import { Player } from '@common/player';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    playerId: string;
    player$: Observable<Player>;
    opponent$: Observable<Player>;

    constructor(private gameService: GameService, private wsService: WebsocketService, private eventBus: EventBusService) {}

    init(): void {
        this.playerId = this.gameService.playerId;
        this.player$ = this.gameService.game$.pipe(
            map((game) => {
                if (this.playerId === (game.creator as Player).id) return game.creator as Player;
                return game.opponent as Player;
            }),
            tap((player) => {
                if (!player.isPlaying) this.eventBus.emit('focusChatBox');
            }),
        );
        this.opponent$ = this.gameService.game$.pipe(
            map((game) => {
                if (this.playerId === (game.creator as Player).id) return game.opponent as Player;
                return game.creator as Player;
            }),
        );
    }

    updateEasel(easel: Letter[]): void {
        this.wsService.updateEasel(easel, this.playerId);
    }
}
