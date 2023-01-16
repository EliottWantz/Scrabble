import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PlayerService } from '@app/services/player/player.service';
import { Player } from '@common/player';

@Component({
    selector: 'app-win-game',
    templateUrl: './win-game.component.html',
    styleUrls: ['./win-game.component.scss'],
})
export class WinGameComponent implements OnInit {
    win: boolean;
    draw: boolean;
    player: Player;
    opponent: Player;
    constructor(private matDialog: MatDialog, public playerService: PlayerService) {}

    ngOnInit(): void {
        this.draw = false;
        this.win = false;
        this.playerService.player$.subscribe((player) => (this.player = player));
        this.playerService.opponent$.subscribe((player) => (this.opponent = player));

        if (this.player.score > this.opponent.score) {
            this.win = true;
        } else if (this.player.score < this.opponent.score) {
            this.win = false;
        } else {
            this.draw = true;
        }
    }
    closeModal(): void {
        this.matDialog.closeAll();
    }
}
