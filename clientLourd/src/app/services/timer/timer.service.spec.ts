import { TestBed } from '@angular/core/testing';
import { GameService } from '@app/services/game/game.service';
import { WebsocketService } from '@app/services/socket/websocket.service';
import { stubGame } from '@app/utils/mocks/game';
import { MockSocketTestHelper } from '@app/utils/mocks/socket-test-helper';
import { ClientEvents, ServerEvents } from '@common/websocket';
import { BehaviorSubject } from 'rxjs';
import { Socket } from 'socket.io-client';
import { TimerService } from './timer.service';

const RESPONSE_DELAY = 300;

describe('TimerService', () => {
    let service: TimerService;
    let socketTestHelper: MockSocketTestHelper;
    let wsServiceSpy: jasmine.SpyObj<WebsocketService>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;

    beforeEach(() => {
        socketTestHelper = new MockSocketTestHelper();
        wsServiceSpy = jasmine.createSpyObj('WebsocketService', ['on'], {
            socket: socketTestHelper as unknown as Socket<ServerEvents, ClientEvents>,
        });
        gameServiceSpy = jasmine.createSpyObj('GameService', [''], {
            game$: new BehaviorSubject(stubGame),
        });
        TestBed.configureTestingModule({
            providers: [TimerService, { provide: WebsocketService, useValue: wsServiceSpy }, { provide: GameService, useValue: gameServiceSpy }],
        });
        service = TestBed.inject(TimerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('init() should create the timer$ with the value of the game timer', () => {
        service.init();
        expect(service.timer$.getValue()).toBe(stubGame.timer);
    });

    it('init() should update timer on updateTimer event', (done) => {
        const newTimer = 1000;
        service.init();
        socketTestHelper.peerSideEmit('updateTimer', newTimer);
        setTimeout(() => {
            expect(service.timer$.getValue()).toBe(newTimer);
            done();
        }, RESPONSE_DELAY);
    });
});
