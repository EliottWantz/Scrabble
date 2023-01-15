/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { WebsocketService } from '@app/services/socket/websocket.service';
import { stubGame } from '@app/utils/mocks/game';
import { MockSocketTestHelper } from '@app/utils/mocks/socket-test-helper';
import { GameOptions, JoinMultiplayerOption, ReconnectionInfo } from '@common/game';
import { GameMode } from '@common/game-mode';
import { Player, PlayerInfo } from '@common/player';
import { ClientEvents, ServerEvents } from '@common/websocket';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { GameService } from './game.service';

describe('GameService', () => {
    let service: GameService;
    let socketTestHelper: MockSocketTestHelper;
    let wsServiceSpy: jasmine.SpyObj<WebsocketService>;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;

    const stubPlayerInfo: PlayerInfo = {
        name: 'test player',
        id: '123456789',
    };

    const stubPlayer: Omit<Player, 'score'> = {
        ...stubPlayerInfo,
        completedWords: [],
        easel: [],
        isPlaying: false,
        isVirtual: false,
        hasAbandon: false,
    };

    const stubGameOptionsWithoutId: Omit<GameOptions, 'playerId'> = {
        playerName: stubPlayer.name,
        time: 60,
        isMultiplayer: true,
        dictionary: 'Default',
        gameMode: GameMode.Classic,
    };

    const stubGameOptions: GameOptions = {
        ...stubGameOptionsWithoutId,
        playerId: stubPlayerInfo.id,
    };

    beforeEach(() => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', [
            'requestAllGames',
            'connect',
            'reconnect',
            'createGame',
            'joinGame',
            'requestAllGames',
            'startGame',
            'requestRejectPlayer',
            'convertToSolo',
            'requestScore',
            'getVirtualPlayerName',
        ]);
        communicationServiceSpy.requestScore.and.returnValue(of([]));
        communicationServiceSpy.getVirtualPlayerName.and.returnValue(of('virtualPlayer'));
        communicationServiceSpy.requestAllGames.and.returnValue(of([stubGame]));
        socketTestHelper = new MockSocketTestHelper();
        wsServiceSpy = jasmine.createSpyObj('WebsocketService', ['abandonGame', 'leaveRoom'], {
            socket: socketTestHelper as unknown as Socket<ServerEvents, ClientEvents>,
        });
        TestBed.configureTestingModule({
            imports: [MatDialogModule, RouterTestingModule],
            providers: [
                GameService,
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: WebsocketService, useValue: wsServiceSpy },
            ],
        });
        service = TestBed.inject(GameService);
        service.init();
    });

    afterEach(() => {
        service.game$.unsubscribe();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('init() should initialize joinableGames$ attribute', (done) => {
        expect(service.joinableGames$).toBeDefined();
        service.joinableGames$.subscribe((joinableGames) => {
            expect(joinableGames).toEqual([stubGame]);
            done();
        });
        service.allGames$.next([stubGame]);
    });

    it('should handle start game event', () => {
        const dialogSpy = spyOn(service.dialog, 'closeAll');
        const routerSpy = spyOn(service.router, 'navigate');
        const socketOffSpy = spyOn(wsServiceSpy.socket, 'off');
        service['handleStartGameEvent']();
        socketTestHelper.peerSideEmit('startGame', stubGame);

        expect(socketOffSpy).toHaveBeenCalledWith('updateGamesAvailable');
        expect(service.game$.getValue()).toEqual(stubGame);
        expect(dialogSpy).toHaveBeenCalled();
        expect(routerSpy).toHaveBeenCalledWith(['/game']);
    });

    it('should handle update game event', () => {
        service['handleUpdateGameEvent']();
        socketTestHelper.peerSideEmit('updateGame', stubGame);
        expect(service.game$.getValue()).toEqual(stubGame);
    });

    it('should handle updateGamesAvailable event', fakeAsync(() => {
        communicationServiceSpy.requestAllGames.and.returnValues(of([stubGame]));
        service.allGames$.subscribe((games) => {
            expect(games).toEqual([stubGame]);
        });
        service['handleUpdateGamesAvailable']();
        socketTestHelper.peerSideEmit('updateGamesAvailable', [stubGame]);
        tick();
        expect(communicationServiceSpy.requestAllGames).toHaveBeenCalled();
    }));

    it('should connect to server', fakeAsync(() => {
        communicationServiceSpy.connect.and.returnValue(Promise.resolve(stubPlayer.id));
        const id = service.connectToServer(stubPlayer.name);
        tick();
        expectAsync(id).toBeResolvedTo(stubPlayer.id);
        expect(service.playerId).toEqual(stubPlayer.id);
    }));

    it('should reconnect to server', fakeAsync(() => {
        const reconnectionValue: ReconnectionInfo = { id: 'id', game: stubGame };
        communicationServiceSpy.reconnect.and.returnValue(Promise.resolve(reconnectionValue));
        const handleUpdateGameEventSpy = spyOn<any>(service, 'handleUpdateGameEvent').and.callFake(() => {
            return;
        });
        service.reconnectToServer(stubPlayerInfo, stubGame.id);
        tick();
        expect(handleUpdateGameEventSpy).toHaveBeenCalled();
        expect(service.playerId).toEqual('id');
    }));

    it('createGame() should create the game and register updateGame and startGame events', fakeAsync(() => {
        const connectToServerSpy = spyOn(service, 'connectToServer').and.resolveTo(stubPlayer.id);

        const handleStartGameEventSpy = spyOn<any>(service, 'handleStartGameEvent');
        const handleUpdateGameEventSpy = spyOn<any>(service, 'handleUpdateGameEvent');
        communicationServiceSpy.createGame.and.resolveTo(stubGame);

        service.createGame(stubGameOptionsWithoutId);
        tick();
        expect(connectToServerSpy).toHaveBeenCalledWith(stubGameOptionsWithoutId.playerName);
        expect(handleStartGameEventSpy).toHaveBeenCalled();
        expect(handleUpdateGameEventSpy).toHaveBeenCalled();
        expect(communicationServiceSpy.createGame).toHaveBeenCalledWith(stubGameOptions);
        expect(service.game$.getValue()).toEqual(stubGame);
    }));

    it('joinGame() should join the game and register updateGame and startGame events', fakeAsync(() => {
        spyOn<any>(service, 'handleStartGameEvent');
        spyOn<any>(service, 'handleUpdateGameEvent');
        communicationServiceSpy.joinGame.and.resolveTo(stubGame);
        const joinGameOptions: JoinMultiplayerOption = {
            gameId: stubGame.id,
            playerInfo: stubPlayerInfo,
        };
        service.playerId = stubPlayer.id;
        service.joinGame(stubGame.id, stubGameOptionsWithoutId.playerName);
        tick();
        expect(service['handleStartGameEvent']).toHaveBeenCalled();
        expect(service['handleUpdateGameEvent']).toHaveBeenCalled();
        expect(communicationServiceSpy.joinGame).toHaveBeenCalledOnceWith(joinGameOptions);
        expect(service.game$.getValue()).toEqual(stubGame);
    }));

    it('viewGames() should connect to server, fetch all games and handle updateGamesAvailable event', fakeAsync(() => {
        spyOn(service, 'connectToServer');
        spyOn<any>(service, 'fetchAllGames');
        spyOn<any>(service, 'handleUpdateGamesAvailable');
        service.viewGames(stubPlayer.name);
        tick();
        expect(service.connectToServer).toHaveBeenCalledWith(stubPlayer.name);
        expect(service['fetchAllGames']).toHaveBeenCalled();
        expect(service['handleUpdateGamesAvailable']).toHaveBeenCalled();
    }));

    it('fetchAllGames() should update allGames$ with the returned value of requestAllGames()', () => {
        communicationServiceSpy.requestAllGames.and.returnValues(of([stubGame]));
        service.allGames$.subscribe((games) => {
            expect(games).toEqual([stubGame]);
        });
        service['fetchAllGames']();
        expect(communicationServiceSpy.requestAllGames).toHaveBeenCalled();
    });

    it('startGame() should call commService startGame() method', fakeAsync(() => {
        service.game$.next(stubGame);
        communicationServiceSpy.startGame.and.resolveTo();
        service.startGame();
        tick();
        expect(communicationServiceSpy.startGame).toHaveBeenCalledWith(stubGame.id);
    }));

    it('startGame() should call commService startGame() method', fakeAsync(() => {
        communicationServiceSpy.requestScore.and.returnValue(of());
        service.fetchScores(GameMode.Classic);
        tick();
        expect(communicationServiceSpy.requestScore).toHaveBeenCalledWith(GameMode.Classic);
    }));

    it('rejectPlayer() should call commService requestRejectPlayer() method', () => {
        service.game$.next(stubGame);
        communicationServiceSpy.requestRejectPlayer.and.returnValue(of());
        service.rejectPlayer();
        expect(communicationServiceSpy.requestRejectPlayer).toHaveBeenCalledWith(stubGame.id);
    });

    it('should convert', () => {
        const opp = 'opponentName';
        communicationServiceSpy.convertToSolo.and.returnValue(of());
        service.game$.next(stubGame);
        service.convertToSolo(opp, GameMode.Classic);
        expect(communicationServiceSpy.convertToSolo).toHaveBeenCalledWith(stubGame.id, opp, GameMode.Classic);
    });
    it('createSoloGame() should call create game then convert game', fakeAsync(() => {
        const convertSpy = spyOn(service, 'convertToSolo').and.returnValue();
        const createGameSpy = spyOn(service, 'createGame').and.resolveTo();
        const stubSoloGameOptionsWithoutId: Omit<GameOptions, 'playerId'> = { ...stubGameOptionsWithoutId, opponentName: 'opp' };
        service.createSoloGame(stubSoloGameOptionsWithoutId, GameMode.Classic);
        tick();

        expect(createGameSpy).toHaveBeenCalled();
        expect(convertSpy).toHaveBeenCalledWith('opp', GameMode.Classic);
    }));
});
