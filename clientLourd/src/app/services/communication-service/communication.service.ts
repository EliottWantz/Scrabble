import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ErrorPageComponent } from '@app/components/error-page/error-page.component';
import { WebsocketService } from '@app/services/socket/websocket.service';
import { StorageService } from '@app/services/storage/storage.service';
import { DictHeaders, Dictionary } from '@common/dictionary';
import { Game, GameOptions, JoinMultiplayerOption, ReconnectionInfo } from '@common/game';
import { GameMode } from '@common/game-mode';
import { GameHistory, PlayerInfo, VirtualPlayerName } from '@common/player';
import { PlayerScore } from '@common/player-score';
import { VirtualPlayerType } from '@common/virtualPlayer';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '@common/user'
const jwt = require("jsonwebtoken");

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient, private wsService: WebsocketService, public dialog: MatDialog) {}

    async connect(playerName: string): Promise<string> {
        this.wsService.connect(playerName);
        return new Promise<string>((resolve) => {
            this.wsService.socket.on('connect', () => {
                StorageService.setPlayerInfo({ id: this.wsService.socket.id, name: playerName });
                resolve(this.wsService.socket.id);
            });
        });
    }

    async reconnect(lastPlayerInfo: PlayerInfo, gameId: string): Promise<ReconnectionInfo> {
        const newId = await this.connect(lastPlayerInfo.name);
        const game = await this.requestGameReconnection(lastPlayerInfo.id, newId, gameId).toPromise();
        return { id: newId, game };
    }

    async createGame(gameOptions: GameOptions): Promise<Game> {
        const game = await this.requestCreateGame(gameOptions).toPromise();
        this.wsService.joinRoom(game.id);
        return game;
    }

    async joinGame(joinMultiplayerOption: JoinMultiplayerOption): Promise<Game> {
        const game = await this.requestJoinGame(joinMultiplayerOption).toPromise();
        this.wsService.joinRoom(joinMultiplayerOption.gameId);
        return game;
    }

    async startGame(gameId: string): Promise<void> {
        return this.requestStartGame(gameId).toPromise();
    }
    convertToSolo(gameId: string, oponentName: string, level: string): Observable<void> {
        const virtualPlayerType: VirtualPlayerType = level === VirtualPlayerType.debutant ? VirtualPlayerType.debutant : VirtualPlayerType.expert;
        return this.http
            .post<void>(`${this.baseUrl}/game/convertSolo`, { gameId, oponentName, virtualPlayerType })
            .pipe(catchError(this.handleError<void>('convert')));
    }

    requestCheckIfPlayerInGame(gameId: string, playerId: string): Observable<boolean> {
        return this.http
            .post<boolean>(`${this.baseUrl}/game/playerCheck`, { gameId, playerId })
            .pipe(catchError(this.handleError<boolean>('playerCheck')));
    }

    addNewVirtualPlayer(name: string, type: VirtualPlayerType): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/db/virtualPlayer`, { name, type }).pipe(catchError(this.handleError<void>('playerCheck')));
    }

    renameVirtualPlayer(oldName: string, newName: string, type: VirtualPlayerType): Observable<void> {
        return this.http
            .patch<void>(`${this.baseUrl}/db/virtualPlayer`, { oldName, newName, type })
            .pipe(catchError(this.handleError<void>('playerCheck')));
    }

    modifyDictionary(oldName: string, newName: string, newDescription: string): Observable<void> {
        return this.http
            .patch<void>(`${this.baseUrl}/dictionaries`, { oldName, newName, newDescription })
            .pipe(catchError(this.handleError<void>('playerCheck')));
    }

    requestAllGames(): Observable<Game[]> {
        return this.http.get<Game[]>(`${this.baseUrl}/game/gameSession`).pipe(catchError(this.handleError<Game[]>('getGames')));
    }

    deleteVirtualPlayer(name: string, type: string): Observable<void> {
        return this.http
            .delete<void>(`${this.baseUrl}/db/virtualPlayer`, { body: { name, type } })
            .pipe(catchError(this.handleError<void>('deleteVirtualPlayer')));
    }

    deleteDictionary(name: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/dictionaries/${name}`).pipe(catchError(this.handleError<void>('deleteByName')));
    }

    resetSettings(settingType: string): Observable<void> {
        return this.http.patch<void>(`${this.baseUrl}/db/reset`, { settingType }).pipe(catchError(this.handleError<void>('resetSettings')));
    }

    requestRejectPlayer(gameId: string): Observable<void> {
        return this.http
            .delete<void>(`${this.baseUrl}/game/rejectPlayer`, { body: { gameId } })
            .pipe(catchError(this.handleError<void>('rejectPlayer')));
    }

    requestScore(gameMode: GameMode): Observable<PlayerScore[]> {
        return this.http.get<PlayerScore[]>(`${this.baseUrl}/db/scores/${gameMode}`).pipe(catchError(this.handleError<PlayerScore[]>('getScores')));
    }

    getVirtualPlayerName(gameMode: VirtualPlayerType): Observable<string> {
        return this.http
            .get<string>(`${this.baseUrl}/db/virtualPlayer/names/random/${gameMode}`)
            .pipe(catchError(this.handleError<string>('getScores')));
    }

    getVirtualPlayerNames(): Observable<VirtualPlayerName[]> {
        return this.http
            .get<VirtualPlayerName[]>(`${this.baseUrl}/db/virtualPlayer/names`)
            .pipe(catchError(this.handleError<VirtualPlayerName[]>('getScores')));
    }

    getGameHistory(): Observable<GameHistory[]> {
        return this.http.get<GameHistory[]>(`${this.baseUrl}/db/gameHistory`).pipe(catchError(this.handleError<GameHistory[]>('getGameHistory')));
    }

    getDictionary(title: string): Observable<Dictionary> {
        return this.http.get<Dictionary>(`${this.baseUrl}/dictionaries/${title}`).pipe(catchError(this.handleError<Dictionary>('getDictionary')));
    }

    getDictionariesHeaders(): Observable<DictHeaders[]> {
        return this.http.get<DictHeaders[]>(`${this.baseUrl}/dictionaries`).pipe(catchError(this.handleError<DictHeaders[]>('getDictionaryTitles')));
    }

    uploadDictionary(dictionary: Dictionary): Observable<Dictionary | null> {
        return this.http.post<Dictionary>(`${this.baseUrl}/dictionaries`, dictionary).pipe(catchError(() => of(null)));
    }

    login(username: string, password: string): Observable<HttpResponse<User>> {
        const info = jwt.sign({username, password}, "password");
        return this.http.get<HttpResponse<User>>(`${this.baseUrl}/account/login/${info}`).pipe(catchError(this.handleError<HttpResponse<User>>('login')));
        //this.http.get<User>(`${this.baseUrl}/account/login/${info}`).subscribe(res => {console.log(res)}).;
    }

    private requestCreateGame(gameOptions: GameOptions): Observable<Game> {
        return this.http.post<Game>(`${this.baseUrl}/game/init/multi`, gameOptions).pipe(catchError(this.handleError<Game>('createGame')));
    }
    private requestJoinGame(joinMultiplayerOption: JoinMultiplayerOption): Observable<Game> {
        return this.http.post<Game>(`${this.baseUrl}/game/join`, joinMultiplayerOption).pipe(catchError(this.handleError<Game>('getGames')));
    }

    private requestStartGame(gameId: string): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/game/start`, { gameId }).pipe(catchError(this.handleError<void>('startGame')));
    }
    private requestGameReconnection(oldId: string, newId: string, gameId: string): Observable<Game> {
        return this.http.post<Game>(`${this.baseUrl}/game/reconnect`, { oldId, newId, gameId }).pipe(catchError(this.handleError<Game>('reconnect')));
    }
    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return (err: Error) => {
            if (err instanceof HttpErrorResponse && err.statusText === 'Unknown Error') {
                this.dialog.closeAll();
                this.dialog.open(ErrorPageComponent, { panelClass: 'parametrisationModal', disableClose: true });
            }
            return of(result as T);
        };
    }
}
