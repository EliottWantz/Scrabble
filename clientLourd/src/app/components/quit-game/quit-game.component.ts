import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameService } from '@app/services/game/game.service';
import { WebsocketService } from '@app/services/socket/websocket.service';

@Component({
    selector: 'app-quit-game',
    templateUrl: './quit-game.component.html',
    styleUrls: ['./quit-game.component.scss'],
})
export class QuitGameComponent {
    constructor(private matDialog: MatDialog, private wsService: WebsocketService, private gameService: GameService) {}
    closeDialog() {
        this.matDialog.closeAll();
    }
    sendDialog(): void {
        if (!this.gameService.game$.value.hasEnded) {
            this.wsService.abandonGame();
        } else {
            this.wsService.leaveRoom();
        }
        this.closeDialog();
    }
}
