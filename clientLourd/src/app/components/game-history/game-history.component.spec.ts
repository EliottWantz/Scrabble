import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TimerPipe } from '@app/pipes/timer.pipe';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { GameService } from '@app/services/game/game.service';
import { WebsocketService } from '@app/services/socket/websocket.service';
import { GAME_HISTORY_MOCKS } from '@app/utils/mocks/game-history-mocks';
import { MockSocketTestHelper } from '@app/utils/mocks/socket-test-helper';
import { GameHistory } from '@common/player';
import { ClientEvents, ServerEvents } from '@common/websocket';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { GameHistoryComponent } from './game-history.component';

describe('GameHistoryComponent', () => {
    let component: GameHistoryComponent;
    let fixture: ComponentFixture<GameHistoryComponent>;
    let commServiceSpy: jasmine.SpyObj<CommunicationService>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let wsServiceSpy: jasmine.SpyObj<WebsocketService>;
    let socketHelper: MockSocketTestHelper;

    beforeEach(async () => {
        socketHelper = new MockSocketTestHelper();
        commServiceSpy = jasmine.createSpyObj('CommunicationService', ['getGameHistory']);
        wsServiceSpy = jasmine.createSpyObj('WebsocketService', ['connect'], {
            socket: socketHelper as unknown as Socket<ServerEvents, ClientEvents>,
        });
        gameServiceSpy = jasmine.createSpyObj('GameService', [''], {
            wsService: wsServiceSpy,
        });

        await TestBed.configureTestingModule({
            declarations: [GameHistoryComponent, TimerPipe],
            imports: [MatPaginatorModule, MatTableModule, BrowserAnimationsModule],
            providers: [
                { provide: CommunicationService, useValue: commServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        commServiceSpy.getGameHistory.and.returnValue(of([GAME_HISTORY_MOCKS]));
        fixture = TestBed.createComponent(GameHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set the data when listening to resetHistory', fakeAsync(() => {
        socketHelper.peerSideEmit('resetHistory', [GAME_HISTORY_MOCKS]);
        setTimeout(() => {
            const data: MatTableDataSource<GameHistory> = new MatTableDataSource<GameHistory>([GAME_HISTORY_MOCKS]);
            expect(component.data.data).toEqual(data.data);
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- this is a test
        }, 1000);
        flush();
    }));
});
