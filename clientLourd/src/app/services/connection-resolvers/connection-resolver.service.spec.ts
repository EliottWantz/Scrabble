import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { GameService } from '@app/services/game/game.service';
import { WebsocketService } from '@app/services/socket/websocket.service';
import { StorageService } from '@app/services/storage/storage.service';
import { stubGame } from '@app/utils/mocks/game';
import { stubPlayerInfo } from '@app/utils/mocks/player';
import { MockSocketTestHelper } from '@app/utils/mocks/socket-test-helper';
import { Game } from '@common/game';
import { ClientEvents, ServerEvents } from '@common/websocket';
import { BehaviorSubject } from 'rxjs';
import { Socket } from 'socket.io-client';
import { ConnectionResolver } from './connection-resolver.service';

describe('ConnectionResolverService', () => {
    let service: ConnectionResolver;
    let socketTestHelper: MockSocketTestHelper;
    let wsServiceSpy: jasmine.SpyObj<WebsocketService>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;

    beforeEach(() => {
        socketTestHelper = new MockSocketTestHelper();
        wsServiceSpy = jasmine.createSpyObj('WebsocketService', ['socketAlive'], {
            socket: socketTestHelper as unknown as Socket<ServerEvents, ClientEvents>,
        });
        spyOn(StorageService, 'getPlayerInfo').and.returnValue(stubPlayerInfo);

        gameServiceSpy = jasmine.createSpyObj('GameService', ['init', 'reconnectToServer'], {
            game$: new BehaviorSubject<Game>(stubGame),
        });
        TestBed.configureTestingModule({
            providers: [
                { provide: WebsocketService, useValue: wsServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
            ],
        });
        service = TestBed.inject(ConnectionResolver);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('resolve() should return false if socket is alive', fakeAsync(() => {
        wsServiceSpy.socketAlive.and.returnValue(true);
        const result = service.resolve();
        tick();
        expect(gameServiceSpy.init).not.toHaveBeenCalled();
        expect(gameServiceSpy.reconnectToServer).not.toHaveBeenCalled();
        expectAsync(result).toBeResolvedTo(false);
    }));

    it('resolve() should call gameService init() if socket dead', () => {
        wsServiceSpy.socketAlive.and.returnValue(false);
        service.resolve();
        expect(gameServiceSpy.init).toHaveBeenCalled();
    });

    it('resolve() should reconnect to server and assign the return game to the gameService if socket dead', fakeAsync(() => {
        wsServiceSpy.socketAlive.and.returnValue(false);
        spyOn(StorageService, 'getCurrentGame').and.returnValue(stubGame.id);
        const result = service.resolve();
        tick();
        expect(gameServiceSpy.game$.getValue()).toEqual(stubGame);
        expect(gameServiceSpy.reconnectToServer).toHaveBeenCalledWith(stubPlayerInfo, stubGame.id);
        expectAsync(result).toBeResolvedTo(true);
    }));
});
