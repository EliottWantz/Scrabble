import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { EventBusService } from '@app/services/events/event-bus.service';
import { GameService } from '@app/services/game/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { WebsocketService } from '@app/services/socket/websocket.service';
import { stubGame } from '@app/utils/mocks/game';
import { PlayAreaMock } from '@app/utils/mocks/play-area';
import { stubPlayer, stubPlayer2 } from '@app/utils/mocks/player';
import { SidebarMock } from '@app/utils/mocks/sidebar';
import { MockSocketTestHelper } from '@app/utils/mocks/socket-test-helper';
import { Game } from '@common/game';
import { BehaviorSubject, of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { GamePageComponent } from './game-page.component';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let wsServiceSpy: jasmine.SpyObj<WebsocketService>;
    let socketHelper: MockSocketTestHelper;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let eventBusSpy: jasmine.SpyObj<EventBusService>;
    beforeEach(async () => {
        socketHelper = new MockSocketTestHelper();

        gameServiceSpy = jasmine.createSpyObj('GameService', [], {
            game$: new BehaviorSubject<Game>(stubGame),
        });
        wsServiceSpy = jasmine.createSpyObj('WebsocketService', ['connect'], {
            socket: socketHelper as unknown as Socket,
        });
        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['init'], {
            player$: of(stubPlayer),
            opponent$: of(stubPlayer2),
        });
        eventBusSpy = jasmine.createSpyObj('EventBusService', ['emit']);
        await TestBed.configureTestingModule({
            imports: [AppRoutingModule, MatDialogModule],
            declarations: [GamePageComponent, SidebarMock, PlayAreaMock],
            providers: [
                { provide: GameService, useValue: gameServiceSpy },
                { provide: WebsocketService, useValue: wsServiceSpy },
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: EventBusService, useValue: eventBusSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
        wsServiceSpy = TestBed.inject(WebsocketService) as jasmine.SpyObj<WebsocketService>;
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit focusChatBox event', fakeAsync(() => {
        component.ngAfterViewInit();
        tick();
        expect(eventBusSpy.emit).toHaveBeenCalledWith('focusChatBox');
    }));
});
