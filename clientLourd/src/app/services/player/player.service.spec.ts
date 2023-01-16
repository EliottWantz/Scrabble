/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { EventBusService } from '@app/services/events/event-bus.service';
import { GameService } from '@app/services/game/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { WebsocketService } from '@app/services/socket/websocket.service';
import { MockEventBusTestHelper } from '@app/utils/mocks/event-bus-test-helper';
import { stubGame } from '@app/utils/mocks/game';
import { stubPlayer, stubPlayer2 } from '@app/utils/mocks/player';
import { MockSocketTestHelper } from '@app/utils/mocks/socket-test-helper';
import { Game } from '@common/game';
import { Player } from '@common/player';
import { BehaviorSubject } from 'rxjs';
import { Socket } from 'socket.io-client';

describe('PlayerServiceService', () => {
    let service: PlayerService;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let wsServiceSpy: jasmine.SpyObj<WebsocketService>;
    let socketHelper: MockSocketTestHelper;
    let eventBusTestHelper: MockEventBusTestHelper;
    let game: Game;

    beforeEach(async () => {
        game = JSON.parse(JSON.stringify(stubGame));
        socketHelper = new MockSocketTestHelper();
        eventBusTestHelper = new MockEventBusTestHelper();
        gameServiceSpy = jasmine.createSpyObj('GameService', ['init'], {
            game$: new BehaviorSubject<Game>(game),
            playerId: stubPlayer.id,
        });
        wsServiceSpy = jasmine.createSpyObj('WebSocketService', ['socketAlive', 'emit', 'on', 'updateEasel'], {
            socket: socketHelper as unknown as Socket,
        });
        TestBed.configureTestingModule({
            providers: [
                { provide: WebsocketService, useValue: wsServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
                { provide: EventBusService, useValue: eventBusTestHelper },
            ],
        });
        service = TestBed.inject(PlayerService);
        gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
        wsServiceSpy = TestBed.inject(WebsocketService) as jasmine.SpyObj<WebsocketService>;
        service.init();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('init() should initialize playerId, player$ and opponent$', () => {
        service.init();
        expect(service.playerId).toEqual(stubPlayer.id);
        expect(service.player$).toBeTruthy();
        expect(service.opponent$).toBeTruthy();
    });

    it('should emit focusChatBox to the player when his turn is over', (done) => {
        const eventBusEmitSpy = spyOn(eventBusTestHelper, 'emit');
        (game.creator as Player).isPlaying = false;
        service.player$.subscribe(() => {
            expect(eventBusEmitSpy).toHaveBeenCalledWith('focusChatBox');
            done();
        });
        gameServiceSpy.game$.next(game);
    });

    it('should not emit focusChatBox to the player is playing', (done) => {
        const eventBusEmitSpy = spyOn(eventBusTestHelper, 'emit');
        (game.creator as Player).isPlaying = true;
        service.player$.subscribe(() => {
            expect(eventBusEmitSpy).not.toHaveBeenCalledWith('focusChatBox');
            done();
        });
        gameServiceSpy.game$.next(game);
    });

    it('should make player stubPlayer and opponent stubPlayer2', () => {
        service.playerId = stubPlayer.id;
        game.creator = stubPlayer;
        game.opponent = stubPlayer2;
        gameServiceSpy.game$.next(game);
        service.player$.subscribe((player) => {
            expect(player).toEqual(stubPlayer);
        });
        service.opponent$.subscribe((opponent) => {
            expect(opponent).toEqual(stubPlayer2);
        });
    });

    it('should make player stubPlayer2 and opponent stubPlayer', () => {
        service.playerId = stubPlayer2.id;
        game.creator = stubPlayer;
        game.opponent = stubPlayer2;
        gameServiceSpy.game$.next(game);
        service.player$.subscribe((player) => {
            expect(player).toEqual(stubPlayer2);
        });

        service.opponent$.subscribe((opponent) => {
            expect(opponent).toEqual(stubPlayer);
        });
    });

    it('updateEasel() should call ws updateEasel()', () => {
        service.playerId = stubPlayer.id;
        service.updateEasel(stubPlayer.easel);
        expect(wsServiceSpy.updateEasel).toHaveBeenCalledWith(stubPlayer.easel, stubPlayer.id);
    });
});
