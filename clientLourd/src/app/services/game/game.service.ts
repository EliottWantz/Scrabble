import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { WebsocketService } from '@app/services/socket/websocket.service';
import { StorageService } from '@app/services/storage/storage.service';
import { Game, GameOptions, JoinMultiplayerOption } from '@common/game';
import { GameMode } from '@common/game-mode';
import { PlayerInfo } from '@common/player';
import { PlayerScore } from '@common/player-score';
import { VirtualPlayerType } from '@common/virtualPlayer';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    allGames$: Subject<Game[]>;
    joinableGames$: Observable<Game[]>;
    game$: BehaviorSubject<Game>;
    playerId: string;

    constructor(private commService: CommunicationService, public wsService: WebsocketService, public dialog: MatDialog, public router: Router) {}

    init(): void {
        this.allGames$ = new Subject();
        this.joinableGames$ = this.allGames$.pipe(map((games) => games.filter((game) => game.capacity < 2)));
        this.game$ = new BehaviorSubject({} as Game);
    }

    async connectToServer(playerName: string): Promise<string> {
        const playerId = await this.commService.connect(playerName);
        this.playerId = playerId;
        return playerId;
    }

    async reconnectToServer(lastPlayerInfo: PlayerInfo, gameId: string): Promise<void> {
        const { id, game } = await this.commService.reconnect(lastPlayerInfo, gameId);
        this.handleUpdateGameEvent();
        this.playerId = id;
        this.game$.next(game);
    }

    async createGame(gameOptionsWithoutId: Omit<GameOptions, 'playerId'>): Promise<void> {
        StorageService.clear();
        const playerId = await this.connectToServer(gameOptionsWithoutId.playerName);
        this.handleStartGameEvent();
        this.handleUpdateGameEvent();
        const gameOptions: GameOptions = {
            ...gameOptionsWithoutId,
            playerId,
        };
        const game = await this.commService.createGame(gameOptions);
        this.game$.next(game);
    }

    async createSoloGame(gameOptionsWithoutId: Omit<GameOptions, 'playerId'>, level: string): Promise<void> {
        await this.createGame(gameOptionsWithoutId);
        this.convertToSolo(gameOptionsWithoutId.opponentName as string, level);
    }

    async joinGame(gameId: string, playerName: string): Promise<void> {
        this.handleStartGameEvent();
        this.handleUpdateGameEvent();
        const player: PlayerInfo = {
            name: playerName,
            id: this.playerId,
        };
        const joinGameOptions: JoinMultiplayerOption = {
            gameId,
            playerInfo: player,
        };
        const game = await this.commService.joinGame(joinGameOptions);
        this.game$.next(game);
    }

    async viewGames(playerName: string): Promise<void> {
        StorageService.clear();
        await this.connectToServer(playerName);
        this.fetchAllGames();
        this.handleUpdateGamesAvailable();
    }
    async startGame(): Promise<void> {
        await this.commService.startGame(this.game$.getValue().id);
    }

    rejectPlayer(): void {
        this.commService.requestRejectPlayer(this.game$.getValue().id).subscribe();
    }

    async fetchScores(mode: GameMode): Promise<PlayerScore[]> {
        return await this.commService.requestScore(mode).toPromise();
    }

    addNewVirtualPlayer(name: string, virtualPlayerType: string): void {
        this.commService.addNewVirtualPlayer(name, virtualPlayerType as VirtualPlayerType).subscribe();
    }
    convertToSolo(oponentName: string, level: string): void {
        this.commService.convertToSolo(this.game$.getValue().id, oponentName, level).subscribe();
    }

    private handleStartGameEvent(): void {
        this.wsService.socket.on('startGame', (game: Game) => {
            StorageService.setCurrentGame(game.id);
            this.wsService.socket.off('updateGamesAvailable');
            this.game$.next(game);
            this.dialog.closeAll();
            this.router.navigate(['/game']);
        });
    }
    private handleUpdateGameEvent(): void {
        this.wsService.socket.on('updateGame', (game: Game) => {
            this.game$.next(game);
        });
    }
    private handleUpdateGamesAvailable(): void {
        this.wsService.socket.on('updateGamesAvailable', async () => {
            const games = await this.commService.requestAllGames().toPromise();
            this.allGames$.next(games);
        });
    }
    private fetchAllGames(): void {
        this.commService.requestAllGames().subscribe((games) => this.allGames$.next(games));
    }
}
