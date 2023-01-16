import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PlayerService } from '@app/services/player/player.service';
import { WebsocketService } from '@app/services/socket/websocket.service';
import { Player } from '@common/player';

@Component({
    selector: 'app-player-abandoned',
    templateUrl: './player-abandoned.component.html',
    styleUrls: ['./player-abandoned.component.scss'],
})
export class PlayerAbandonedComponent implements OnInit {
    opponent: Player;
    constructor(private matDialog: MatDialog, public playerService: PlayerService, public websocketService: WebsocketService) {}

    ngOnInit(): void {
        this.playerService.opponent$.subscribe((player) => (this.opponent = player));
    }

    closeModal(): void {
        this.matDialog.closeAll();
    }

    leaveGame(): void {
        this.websocketService.deleteGame();
        this.matDialog.closeAll();
    }
}
