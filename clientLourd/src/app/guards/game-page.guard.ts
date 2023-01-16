import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { WebsocketService } from '@app/services/socket/websocket.service';
import { StorageService } from '@app/services/storage/storage.service';
import { Observable, of } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class GamePageGuard implements CanActivate {
    constructor(private commService: CommunicationService, private wsService: WebsocketService) {}
    canActivate(): Observable<boolean> {
        const lastGame: string = StorageService.getCurrentGame();
        if (!lastGame) return of(false);
        if (!this.wsService.socketAlive()) {
            const gameId = StorageService.getCurrentGame();
            const playerInfo = StorageService.getPlayerInfo();
            return this.commService.requestCheckIfPlayerInGame(gameId, playerInfo.id).pipe(first());
        }
        return of(true);
    }
}
