/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* eslint-disable max-lines */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { WebsocketService } from '@app/services/socket/websocket.service';
import { StorageService } from '@app/services/storage/storage.service';
import { dictionaryStub } from '@app/utils/mocks/dictionary-stub';
import { stubGame, stubGameOptions, stubJoinMultiplayerOptions } from '@app/utils/mocks/game';
import { GAME_HISTORY_MOCKS } from '@app/utils/mocks/game-history-mocks';
import { stubPlayer, stubPlayerInfo, stubScore } from '@app/utils/mocks/player';
import { MockSocketTestHelper } from '@app/utils/mocks/socket-test-helper';
import { SETTING_JV_NAMES } from '@common/dictionnary';
import { Game } from '@common/game';
import { GameMode } from '@common/game-mode';
import { VirtualPlayerName } from '@common/player';
import { VirtualPlayerType } from '@common/virtualPlayer';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';

describe('CommunicationService', () => {
    let httpMock: HttpTestingController;

    let service: CommunicationService;
    let baseUrl: string;
    let wsServiceSpy: jasmine.SpyObj<WebsocketService>;
    let socketHelper: MockSocketTestHelper;

    beforeEach(async () => {
        socketHelper = new MockSocketTestHelper();
        wsServiceSpy = jasmine.createSpyObj(
            'WebsocketService',
            ['connect', 'reconnect', 'joinRoom', 'leaveRoom', 'startGame', 'abandonGame', 'socketAlive'],
            {
                socket: socketHelper as unknown as Socket,
            },
        );
        wsServiceSpy.socket.id = stubPlayer.id;
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, BrowserAnimationsModule, MatDialogModule],
            providers: [{ provide: WebsocketService, useValue: wsServiceSpy }],
        }).compileComponents();
        service = TestBed.inject(CommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
        wsServiceSpy = TestBed.inject(WebsocketService) as jasmine.SpyObj<WebsocketService>;

        // eslint-disable-next-line dot-notation -- baseUrl is private and we need access for the test
        baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('connect() should create the ws connection', () => {
        service.connect(stubPlayer.name);
        expect(wsServiceSpy.connect).toHaveBeenCalledWith(stubPlayer.name);
    });

    it('connect() should save the player info via the storageService and return its id', fakeAsync(() => {
        const storageServiceSpy = spyOn(StorageService, 'setPlayerInfo').and.returnValue();

        const playerId = service.connect(stubPlayer.name);
        socketHelper.peerSideEmit('connect');
        tick();
        expectAsync(playerId).toBeResolvedTo(stubPlayer.id);
        expect(storageServiceSpy).toHaveBeenCalledWith(stubPlayerInfo);
    }));

    it('reconnect() should create a ws connection and call requestGameReconnection(), returning the ReconnectionInfo', fakeAsync(() => {
        const requestGameReconnectionSpy = spyOn<any>(service, 'requestGameReconnection').and.returnValue(of(stubGame));
        const connectSpy = spyOn(service, 'connect').and.resolveTo('test-id');
        const reconnectionInfo = service.reconnect(stubPlayerInfo, stubGame.id);
        socketHelper.peerSideEmit('connect');
        tick();
        expect(connectSpy).toHaveBeenCalledWith(stubPlayerInfo.name);
        expect(requestGameReconnectionSpy).toHaveBeenCalledWith(stubPlayerInfo.id, 'test-id', stubGame.id);
        expectAsync(reconnectionInfo).toBeResolvedTo({ id: 'test-id', game: stubGame });
    }));

    it('createGame() should create game and join ws room', fakeAsync(() => {
        const requestCreateGameSpy = spyOn<any>(service, 'requestCreateGame').and.returnValue(of(stubGame));
        const game = service.createGame(stubGameOptions);
        tick();
        expect(requestCreateGameSpy).toHaveBeenCalledWith(stubGameOptions);
        expect(wsServiceSpy.joinRoom).toHaveBeenCalledWith(stubGame.id);
        expectAsync(game).toBeResolvedTo(stubGame);
    }));

    it('joinGame() should make the joinGame request and join the ws room', fakeAsync(() => {
        const requestJoinGameSpy = spyOn<any>(service, 'requestJoinGame').and.returnValue(of(stubGame));
        const game = service.joinGame(stubJoinMultiplayerOptions);
        tick();
        expect(requestJoinGameSpy).toHaveBeenCalledWith(stubJoinMultiplayerOptions);
        expect(wsServiceSpy.joinRoom).toHaveBeenCalledWith(stubJoinMultiplayerOptions.gameId);
        expectAsync(game).toBeResolvedTo(stubGame);
    }));

    it('convertSolo() should make the convert Solo request and join the ws room', fakeAsync(() => {
        const gameId = stubGame.id;
        const oponentName = 'Eliott';
        const virtualPlayerType = VirtualPlayerType.debutant;
        const requestBody = { gameId, oponentName, virtualPlayerType };
        service.convertToSolo(gameId, oponentName, VirtualPlayerType.debutant).subscribe();
        const req = httpMock.expectOne(`${baseUrl}/game/convertSolo`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(requestBody);
    }));

    it('convertSolo() should make the convert Solo request and join the ws room with expert virtual player type', fakeAsync(() => {
        const gameId = stubGame.id;
        const oponentName = 'Eliott';
        const virtualPlayerType = VirtualPlayerType.expert;
        const requestBody = { gameId, oponentName, virtualPlayerType };
        service.convertToSolo(gameId, oponentName, VirtualPlayerType.expert).subscribe();
        const req = httpMock.expectOne(`${baseUrl}/game/convertSolo`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(requestBody);
    }));

    it('getVirtualPlayerName() should make the get virtual name request', fakeAsync(() => {
        service.getVirtualPlayerName(VirtualPlayerType.expert).subscribe();
        const req = httpMock.expectOne(`${baseUrl}/db/virtualPlayer/names/random/Expert`);
        expect(req.request.method).toBe('GET');
    }));

    it('startGame() should call requestStartGame()', () => {
        const requestStartGameSpy = spyOn<any>(service, 'requestStartGame').and.returnValue(of());
        service.startGame(stubGame.id);
        expect(requestStartGameSpy).toHaveBeenCalledWith(stubGame.id);
    });

    it('requestGameReconnection() should not return anything when sending a POST request (HttpClient called once)', () => {
        const oldId = stubPlayer.id;
        const newId = '987654321';
        const gameId = stubGame.id;
        const requestBody = { oldId, newId, gameId };
        service['requestGameReconnection'](oldId, newId, stubGame.id).subscribe((response) => {
            expect(response).toEqual(stubGame);
        }, fail);
        const req = httpMock.expectOne(`${baseUrl}/game/reconnect`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(requestBody);
        req.flush(stubGame);
    });

    it('requestCheckIfPlayerInGame() should return the answer (HttpClient called once)', () => {
        const gameId = stubGame.id;
        const playerId = stubPlayer.id;
        service.requestCheckIfPlayerInGame(gameId, stubPlayer.id).subscribe((response: any) => {
            expect(response).toEqual(true);
        });
        const req = httpMock.expectOne(`${baseUrl}/game/playerCheck`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ gameId, playerId });
        req.flush(true);
    });

    it('requestCreateGame() should return expected gameId (HttpClient called once)', () => {
        service['requestCreateGame'](stubGameOptions).subscribe((response) => {
            expect(response).toEqual(stubGame);
        }, fail);
        const req = httpMock.expectOne(`${baseUrl}/game/init/multi`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(stubGameOptions);
        req.flush(stubGame);
    });

    it('requestScore() should return  a stub GameScore for Classic Mode (HttpClient called once)', () => {
        const gameMode = GameMode.Classic;
        service.requestScore(gameMode).subscribe((response) => {
            expect(response).toEqual([stubScore]);
        });
        const req = httpMock.expectOne(`${baseUrl}/db/scores/${gameMode}`);
        expect(req.request.method).toBe('GET');
        req.flush([stubScore]);
    });

    it('requestJoinGame() should not return anything (HttpClient called once)', () => {
        service['requestJoinGame'](stubJoinMultiplayerOptions).subscribe((response) => {
            expect(response).toEqual(stubGame);
        }, fail);
        const req = httpMock.expectOne(`${baseUrl}/game/join`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(stubJoinMultiplayerOptions);
        req.flush(stubGame);
    });

    it('requestAllGames() should return expected games (HttpClient called once)', () => {
        const expectedGames: Game[] = [];
        service.requestAllGames().subscribe((response) => {
            expect(response).toEqual(expectedGames);
        });
        const req = httpMock.expectOne(`${baseUrl}/game/gameSession`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedGames);
    });
    it('requestRejectPlayer() should not return any message when sending a POST request (HttpClient called once)', () => {
        const gameId = stubGame.id;
        service.requestRejectPlayer(gameId).subscribe((response) => {
            expect(response).toBeNull();
        });
        const req = httpMock.expectOne(`${baseUrl}/game/rejectPlayer`);
        expect(req.request.method).toBe('DELETE');
        expect(req.request.body).toEqual({ gameId });
        req.flush(null);
    });

    it('requestStartGame() should return nothing (HttpClient called once)', () => {
        const gameId = stubGame.id;
        service['requestStartGame'](gameId).subscribe((response) => {
            expect(response).toBeNull();
        });
        const req = httpMock.expectOne(`${baseUrl}/game/start`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ gameId });
        req.flush(null);
    });
    it('should handle http error safely and open dialog when Error is Unknown', () => {
        const spy = spyOn(service.dialog, 'open');

        service['requestCreateGame'](stubGameOptions).subscribe((response) => {
            expect(response).toBeUndefined();
            expect(spy).toHaveBeenCalled();
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/game/init/multi`);
        expect(req.request.method).toBe('POST');
        req.error(new ErrorEvent('Random error occurred'), { statusText: 'Unknown Error' });
    });

    it('should handle http error safely', () => {
        service['requestCreateGame'](stubGameOptions).subscribe((response) => {
            expect(response).toBeUndefined();
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/game/init/multi`);
        expect(req.request.method).toBe('POST');
        req.error(new ErrorEvent('Random error occurred'), { statusText: 'Known Errror' });
    });

    it('uploadDictionary() should return the dictionary that was uploaded as confirmation', () => {
        service.uploadDictionary(dictionaryStub).subscribe((response) => {
            expect(response).toEqual(dictionaryStub);
        }, fail);
        const req = httpMock.expectOne(`${baseUrl}/dictionaries`);
        expect(req.request.method).toBe('POST');
        req.flush(dictionaryStub);
    });

    it('uploadDictionary() should return null if the dictionary already exists', () => {
        service.uploadDictionary(dictionaryStub).subscribe((response) => {
            expect(response).toBeNull();
        }, fail);
        const req = httpMock.expectOne(`${baseUrl}/dictionaries`);
        expect(req.request.method).toBe('POST');
        req.error(new ErrorEvent('Dictionary already exists'));
    });

    it('getDictionary() should return the dictionary that was uploaded', () => {
        service.getDictionary(dictionaryStub.title).subscribe((response) => {
            expect(response).toEqual(dictionaryStub);
        }, fail);
        const req = httpMock.expectOne(`${baseUrl}/dictionaries/${dictionaryStub.title}`);
        expect(req.request.method).toBe('GET');
        req.flush(dictionaryStub);
    });

    it('getDictionariesTitles() should return the titles of all the dictionaries', () => {
        service.getDictionariesHeaders().subscribe((response) => {
            expect(response).toEqual([
                { title: 'dictionary1', description: '' },
                { title: 'dictionary2', description: '' },
            ]);
        }, fail);
        const req = httpMock.expectOne(`${baseUrl}/dictionaries`);
        expect(req.request.method).toBe('GET');
        req.flush([
            { title: 'dictionary1', description: '' },
            { title: 'dictionary2', description: '' },
        ]);
    });

    it('addNewVirtualPlayer should call the function', () => {
        const requestBody = { name: 'newName', type: VirtualPlayerType.debutant };
        service.addNewVirtualPlayer(requestBody.name, requestBody.type).subscribe();
        const req = httpMock.expectOne(`${baseUrl}/db/virtualPlayer`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(requestBody);
    });

    it('renameVirtualPlayer should call the function', () => {
        const requestBody = { oldName: 'newName', newName: 'newName', type: VirtualPlayerType.debutant };
        service.renameVirtualPlayer(requestBody.oldName, requestBody.newName, requestBody.type).subscribe();
        const req = httpMock.expectOne(`${baseUrl}/db/virtualPlayer`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual(requestBody);
    });

    it('modifyDictionary should call the function', () => {
        const requestBody = { oldName: 'newName', newName: 'newName', newDescription: 'new Description' };
        service.modifyDictionary(requestBody.oldName, requestBody.newName, requestBody.newDescription).subscribe();
        const req = httpMock.expectOne(`${baseUrl}/dictionaries`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual(requestBody);
    });

    it('deleteVirtualPlayer should call the function', () => {
        const requestBody = { name: 'newName', type: VirtualPlayerType.debutant };
        service.deleteVirtualPlayer(requestBody.name, requestBody.type).subscribe();
        const req = httpMock.expectOne(`${baseUrl}/db/virtualPlayer`);
        expect(req.request.method).toBe('DELETE');
        expect(req.request.body).toEqual(requestBody);
    });

    it('deleteDictionary should call the function', () => {
        const requestBody = { name: 'name' };
        service.deleteDictionary(requestBody.name).subscribe();
        const req = httpMock.expectOne(`${baseUrl}/dictionaries/${requestBody.name}`);
        expect(req.request.method).toBe('DELETE');
    });

    it('resetSettings should call the function', () => {
        service.resetSettings(SETTING_JV_NAMES).subscribe();
        const req = httpMock.expectOne(`${baseUrl}/db/reset`);
        expect(req.request.method).toBe('PATCH');
    });

    it('getVirtualPlayerNames should return virtualPlayerName', () => {
        service.getVirtualPlayerNames().subscribe((response) => {
            expect(response).toEqual([virtualPlayerName]);
        });
        const req = httpMock.expectOne(`${baseUrl}/db/virtualPlayer/names`);
        expect(req.request.method).toBe('GET');
        const virtualPlayerName: VirtualPlayerName = { name: 'name', type: VirtualPlayerType.debutant, isReadonly: false };
        req.flush([virtualPlayerName]);
    });

    it('getGameHistory should return gameHistory', () => {
        service.getGameHistory().subscribe((response) => {
            expect(response).toEqual([GAME_HISTORY_MOCKS]);
        });
        const req = httpMock.expectOne(`${baseUrl}/db/gameHistory`);
        expect(req.request.method).toBe('GET');
        req.flush([GAME_HISTORY_MOCKS]);
    });
});
