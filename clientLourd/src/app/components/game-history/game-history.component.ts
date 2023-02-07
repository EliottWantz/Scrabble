/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { GameService } from '@app/services/game/game.service';
import { GameHistory } from '@common/player';

@Component({
    selector: 'app-game-history',
    templateUrl: './game-history.component.html',
    styleUrls: ['./game-history.component.scss'],
})
export class GameHistoryComponent {
    @ViewChild('paginator') paginator: MatPaginator;
    data: MatTableDataSource<GameHistory>;
    displayedColumns: string[] = ['started', 'duration', 'creator', 'creatorScore', 'oponent', 'oponentScore', 'mode', 'gameCompleted'];
    gameHistoryLenght: number;

    constructor(private commmunicationService: CommunicationService, private gameService: GameService) {
        this.commmunicationService.getGameHistory().subscribe((gamehistory) => {
            this.data = new MatTableDataSource<GameHistory>(gamehistory);
            this.data.paginator = this.paginator;
            this.gameHistoryLenght = gamehistory.length;
        });
        this.gameService.wsService.connect('Admin');

        // this.gameService.wsService.socket.on('resetHistory', (history) => {
            // this.data = new MatTableDataSource<GameHistory>(history);
        // });
    }
}
