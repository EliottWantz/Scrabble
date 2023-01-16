/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { PlayerAbandonedComponent } from '@app/components/player-abandoned/player-abandoned.component';
import { QuitGameComponent } from '@app/components/quit-game/quit-game.component';
import { WinGameComponent } from '@app/components/win-game/win-game.component';
import { TimerPipe } from '@app/pipes/timer.pipe';
import { ChatService } from '@app/services/chat/chat.service';
import { EaselService } from '@app/services/easel/easel.service';
import { EventBusService } from '@app/services/events/event-bus.service';
import { GameService } from '@app/services/game/game.service';
import { MousePlacementService } from '@app/services/mouse-placement/mouse-placement.service';
import { PlayerService } from '@app/services/player/player.service';
import { WebsocketService } from '@app/services/socket/websocket.service';
import { TimerService } from '@app/services/timer/timer.service';
import { BoardMock } from '@app/utils/mocks/board';
import { stubGame } from '@app/utils/mocks/game';
import { GameEaselMock } from '@app/utils/mocks/game-easel';
import { stubLetter, stubPlayer, stubPlayer2 } from '@app/utils/mocks/player';
import { PlayerPanelMock } from '@app/utils/mocks/player-panel';
import { MockSocketTestHelper } from '@app/utils/mocks/socket-test-helper';
import { TextSliderMock } from '@app/utils/mocks/text-slider';
import { Command } from '@common/command';
import { Game } from '@common/game';
import { ClientEvents, ServerEvents } from '@common/websocket';
import { BehaviorSubject, of } from 'rxjs';
import { Socket } from 'socket.io-client';

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let socketTestHelper: MockSocketTestHelper;
    let wsServiceSpy: jasmine.SpyObj<WebsocketService>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;
    let timerServiceSpy: jasmine.SpyObj<TimerService>;
    let eventBusSpy: jasmine.SpyObj<EventBusService>;
    let easelServiceSpy: jasmine.SpyObj<EaselService>;
    let mousePlacementServiceSpy: jasmine.SpyObj<MousePlacementService>;

    beforeEach(async () => {
        socketTestHelper = new MockSocketTestHelper();
        wsServiceSpy = jasmine.createSpyObj('WebsocketService', ['sendCommand'], {
            socket: socketTestHelper as unknown as Socket<ServerEvents, ClientEvents>,
        });
        gameServiceSpy = jasmine.createSpyObj('GameService', [], {
            game$: new BehaviorSubject<Game>(stubGame),
            wsService: wsServiceSpy,
        });
        mousePlacementServiceSpy = jasmine.createSpyObj('MousePlacementService', [
            'init',
            'cancelPlacement',
            'cancelPreviousPlacement',
            'confirmPlacement',
            'addLetter',
        ]);
        chatServiceSpy = jasmine.createSpyObj('ChatService', ['addSystemMessage']);
        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['init'], {
            player$: of(stubPlayer),
            opponent$: of(stubPlayer2),
        });
        timerServiceSpy = jasmine.createSpyObj('TimerService', ['init'], {
            timer$: new BehaviorSubject(stubGame.timer),
        });
        eventBusSpy = jasmine.createSpyObj('EventBusService', ['emit']);
        easelServiceSpy = jasmine.createSpyObj('EaselService', ['init', 'removeLetterAccent', 'hasLetters'], {
            exchangeLetters: [stubLetter],
        });
        await TestBed.configureTestingModule({
            imports: [MatDialogModule, BrowserAnimationsModule],
            declarations: [PlayAreaComponent, TimerPipe, TextSliderMock, BoardMock, GameEaselMock, PlayerPanelMock],
            providers: [
                { provide: WebsocketService, useValue: wsServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: ChatService, useValue: chatServiceSpy },
                { provide: TimerService, useValue: timerServiceSpy },
                { provide: EventBusService, useValue: eventBusSpy },
                { provide: EaselService, useValue: easelServiceSpy },
                { provide: MousePlacementService, useValue: mousePlacementServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        stubGame.hasEnded = false;
        gameServiceSpy.game$.next(stubGame);
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.lettersInReserve$).toBeDefined();
        expect(playerServiceSpy.init).toHaveBeenCalled();
        expect(timerServiceSpy.init).toHaveBeenCalled();
        expect(component.timer$).toEqual(timerServiceSpy.timer$.asObservable());
    });

    it('should open win dialog on endOfGame', () => {
        const dialogSpy = spyOn(component.modal, 'open');
        socketTestHelper.peerSideEmit('endOfGame');
        expect(dialogSpy).toHaveBeenCalledWith(WinGameComponent);
    });

    it('should open playerAbandoned dialog when player abandons', () => {
        const dialogSpy = spyOn<any>(component.modal, 'open');
        socketTestHelper.peerSideEmit('playerAbandoned');
        expect(dialogSpy).toHaveBeenCalledWith(PlayerAbandonedComponent);
    });

    it('emitMouseWheelEvent() should emit mouseWheel with deltaY to the eventBus', () => {
        const mouseWheelEvent = {
            deltaY: 100,
        } as WheelEvent;
        component.emitMouseWheelEvent(mouseWheelEvent);
        expect(eventBusSpy.emit).toHaveBeenCalledWith('mouseWheel', mouseWheelEvent.deltaY);
    });

    it('openQuitDialog() should open the matDialog with the QuitGameComponent', () => {
        const dialogSpy = spyOn(component.modal, 'open');
        component.openQuitDialog();
        expect(dialogSpy).toHaveBeenCalled();
        expect(dialogSpy).toHaveBeenCalledWith(QuitGameComponent, { disableClose: true });
    });

    it('openWinDialog() should open the matDialog with the WinGameComponent', () => {
        const dialogSpy = spyOn(component.modal, 'open');
        component['openEndGameDialog']();
        expect(dialogSpy).toHaveBeenCalled();
        expect(dialogSpy).toHaveBeenCalledWith(WinGameComponent);
    });

    it('skipTurn() should send a skip command to the websocket', () => {
        const skipCommand: Command = {
            fullCommand: '!passer',
            name: 'passer',
        };
        component.skipTurn();
        expect(wsServiceSpy.sendCommand).toHaveBeenCalledWith(skipCommand);
    });

    it('should call timer next when the timer is updated', (done) => {
        component.timer$.subscribe((timer) => {
            expect(timer).toBe(gameServiceSpy.game$.getValue().timer);
            done();
        });
        socketTestHelper.peerSideEmit('updateTimer', stubGame.timer);
    });

    it('buttonDetect should call nothing if the game is ended', () => {
        stubGame.hasEnded = true;
        gameServiceSpy.game$.next(stubGame);
        const expectedKey = 'a';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(mousePlacementServiceSpy.cancelPreviousPlacement).not.toHaveBeenCalled();
        expect(mousePlacementServiceSpy.cancelPlacement).not.toHaveBeenCalled();
        expect(mousePlacementServiceSpy.confirmPlacement).not.toHaveBeenCalled();
        expect(mousePlacementServiceSpy.addLetter).not.toHaveBeenCalled();
        expect(eventBusSpy.emit).not.toHaveBeenCalled();
    });

    it('buttonDetect should emit keyPressed if the board is not focused', () => {
        mousePlacementServiceSpy.isBoardFocused = false;
        const expectedKey = 'a';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(eventBusSpy.emit).toHaveBeenCalled();
    });

    it('buttonDetect should not emit keyPressed if the board is focused', () => {
        mousePlacementServiceSpy.isBoardFocused = true;
        const expectedKey = 'a';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(eventBusSpy.emit).not.toHaveBeenCalled();
    });

    it('buttonDetect should call cancelPreviousPlacement if the key is Backspace', () => {
        component.mousePlacementService.isBoardFocused = true;
        const expectedKey = 'Backspace';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        mousePlacementServiceSpy.isBoardFocused = true;
        component.buttonDetect(buttonEvent);
        expect(mousePlacementServiceSpy.cancelPreviousPlacement).toHaveBeenCalled();
    });
    it('buttonDetect should call cancelPlacement if the key is Escape', () => {
        component.mousePlacementService.isBoardFocused = true;
        const expectedKey = 'Escape';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        mousePlacementServiceSpy.isBoardFocused = true;
        component.buttonDetect(buttonEvent);
        expect(mousePlacementServiceSpy.cancelPlacement).toHaveBeenCalled();
    });
    it('buttonDetect should call confirmPlacement if the key is Enter', () => {
        component.mousePlacementService.isBoardFocused = true;
        const expectedKey = 'Enter';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        mousePlacementServiceSpy.isBoardFocused = true;
        component.buttonDetect(buttonEvent);
        expect(mousePlacementServiceSpy.confirmPlacement).toHaveBeenCalled();
    });
    it('buttonDetect should call addletter if the key is a letter', () => {
        component.mousePlacementService.isBoardFocused = true;
        const expectedKey = 'a';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        mousePlacementServiceSpy.isBoardFocused = true;
        component.buttonDetect(buttonEvent);
        expect(mousePlacementServiceSpy.addLetter).toHaveBeenCalled();
    });
});
