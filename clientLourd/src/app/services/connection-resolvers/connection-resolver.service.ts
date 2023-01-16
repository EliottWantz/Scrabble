import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { GameService } from '@app/services/game/game.service';
import { WebsocketService } from '@app/services/socket/websocket.service';
import { StorageService } from '@app/services/storage/storage.service';

@Injectable({
    providedIn: 'root',
})
export class ConnectionResolver implements Resolve<boolean> {
    constructor(private wsService: WebsocketService, private gameService: GameService) {}
    async resolve(): Promise<boolean> {
        if (this.wsService.socketAlive()) return false;
        this.gameService.init();
        const lastPlayerInfo = StorageService.getPlayerInfo();
        const gameId = StorageService.getCurrentGame();
        await this.gameService.reconnectToServer(lastPlayerInfo, gameId);
        return true;
    }
}
