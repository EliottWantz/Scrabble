/* eslint-disable dot-notation */
/* eslint-disable max-lines */
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TimerPipe } from '@app/pipes/timer.pipe';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { GameService } from '@app/services/game/game.service';
import { WebsocketService } from '@app/services/socket/websocket.service';
import { DEFAULT_PARAMETER, FORM_ERROR_MESSAGE, STEPPER_PAGE_IDX } from '@app/utils/constants/parameters-constants';
import { stubGame } from '@app/utils/mocks/game';
import { MockSocketTestHelper } from '@app/utils/mocks/socket-test-helper';
import { Game } from '@common/game';
import { Player } from '@common/player';
import { VirtualPlayerType } from '@common/virtualPlayer';
import { BehaviorSubject, of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { ParametersComponent } from './parameters.component';
const SECOND = 1000;

describe('ParametersComponent', () => {
    let dialog: MatDialog;
    let component: ParametersComponent;
    let fixture: ComponentFixture<ParametersComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let wsServiceSpy: jasmine.SpyObj<WebsocketService>;
    let dictServiceSpy: jasmine.SpyObj<DictionaryService>;
    let socketHelper: MockSocketTestHelper;
    const stubGameId = 'abcdefghijklmnopqrstuvwxyz';

    beforeEach(async () => {
        socketHelper = new MockSocketTestHelper();
        wsServiceSpy = jasmine.createSpyObj('WebsocketService', ['socketAlive', 'disconnect', 'deleteGame', 'removeOpponent', 'leaveRoom'], {
            socket: socketHelper as unknown as Socket,
            room: stubGameId,
        });
        gameServiceSpy = jasmine.createSpyObj(
            'GameService',
            [
                'init',
                'joinGame',
                'startGame',
                'viewGames',
                'createGame',
                'createSoloGame',
                'rejectPlayer',
                'deleteGame',
                'leaveRoom',
                'startSoloGame',
                'convertToSolo',
            ],
            {
                joinableGames$: of([]),
                wsService: wsServiceSpy,
                game$: new BehaviorSubject(JSON.parse(JSON.stringify(stubGame))),
            },
        );
        dictServiceSpy = jasmine.createSpyObj('DictionaryService', ['getVirtualPlayerName', 'init', 'getDictHeaders']);
        await TestBed.configureTestingModule({
            declarations: [ParametersComponent, TimerPipe],
            imports: [
                ReactiveFormsModule,
                ScrollingModule,
                BrowserAnimationsModule,
                MatDialogModule,
                MatStepperModule,
                MatCardModule,
                MatFormFieldModule,
                MatIconModule,
                MatInputModule,
                MatProgressSpinnerModule,
                MatSelectModule,
                MatOptionModule,
            ],
            providers: [
                { provide: GameService, useValue: gameServiceSpy },
                { provide: WebsocketService, useValue: wsServiceSpy },
                { provide: DictionaryService, useValue: dictServiceSpy },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        dialog = TestBed.inject(MatDialog);
        gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
        wsServiceSpy = TestBed.inject(WebsocketService) as jasmine.SpyObj<WebsocketService>;
        fixture = TestBed.createComponent(ParametersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close modal', () => {
        wsServiceSpy.socketAlive.and.returnValue(false);
        const spy = spyOn(dialog, 'closeAll').and.callThrough();
        component.closeModal();
        expect(spy).toHaveBeenCalled();
    });

    it('should call deleteGame() if game alive and creator left', () => {
        gameServiceSpy.game$.value.id = '12414141';
        gameServiceSpy.playerId = 'creator';
        gameServiceSpy.game$.value.creator.id = 'creator';
        wsServiceSpy.socketAlive.and.returnValue(true);
        component.closeModal();
        expect(wsServiceSpy.deleteGame).toHaveBeenCalled();
    });

    it('should call removeOpponent if game alive and opponent left', () => {
        gameServiceSpy.playerId = 'abc';
        gameServiceSpy.game$.value.id = '12414141';
        wsServiceSpy.socketAlive.and.returnValue(true);
        component.closeModal();
        expect(wsServiceSpy.removeOpponent).toHaveBeenCalled();
    });

    it('should call disconnect if game not alive', () => {
        wsServiceSpy.socketAlive.and.returnValue(true);
        gameServiceSpy.game$.value.id = '';
        component.closeModal();
        expect(wsServiceSpy.disconnect).toHaveBeenCalled();
    });

    it('should default to the first step', () => {
        const stepperComponent: MatStepper = fixture.debugElement.query(By.css('mat-stepper'))?.componentInstance;
        expect(stepperComponent.selectedIndex).toBe(0);
    });

    it('should decrement time', () => {
        const time = DEFAULT_PARAMETER.maximumTime;
        component.time = time;
        component.decrementTime();
        expect(component.time).toBe(time - DEFAULT_PARAMETER.timeIncrement);
        expect(component.maxValue).toBeFalse();
    });
    it('should not decrement time', () => {
        const time = DEFAULT_PARAMETER.minimumTime;
        component.time = time;
        component.decrementTime();
        expect(component.time).toBe(time);
        expect(component.minValue).toBeTrue();
    });

    it('should increment time', () => {
        const time = DEFAULT_PARAMETER.minimumTime;
        component.time = time;
        component.incrementTime();
        expect(component.time).toBe(time + DEFAULT_PARAMETER.timeIncrement);
        expect(component.minValue).toBeFalse();
    });

    it('should not increment time', () => {
        const time = DEFAULT_PARAMETER.maximumTime;
        component.time = time;
        component.incrementTime();
        expect(component.time).toBe(time);
        expect(component.maxValue).toBeTrue();
    });

    it('should show missing name error message', () => {
        component.name.setValue('');
        expect(component.getErrorMessage()).toBe(FORM_ERROR_MESSAGE.emptyName);
    });

    it('should show minlenght error message', () => {
        component.name.setValue('Ja');
        expect(component.getErrorMessage()).toBe(FORM_ERROR_MESSAGE.minLenght);
    });
    it('should not show error message', () => {
        component.name.setValue('Jamesley');
        expect(component.getErrorMessage()).toBe();
    });

    describe('should go to pages', () => {
        it('it should goToPageForm for creation of multiplayer game', () => {
            component.goToPageForm('create');
            expect(component.createMultiplayer).toBeTrue();
            expect(component.formPageButtonActive).toBeTrue();
            expect(component.stepper.selectedIndex).toBe(STEPPER_PAGE_IDX.configurationPage);
        });

        it('it should goToPageForm for creation of solo game', fakeAsync(() => {
            dictServiceSpy.getVirtualPlayerName.and.resolveTo('Maximus');
            component.goToPageForm('create', 'solo');
            tick();
            expect(dictServiceSpy.getVirtualPlayerName).toHaveBeenCalled();
            setTimeout(() => {
                expect(component.createMultiplayer).toBeTrue();
                expect(component.virtualPlayerName).toBeDefined();
                expect(component.formPageButtonActive).toBeTrue();
                expect(component.stepper.selectedIndex).toBe(STEPPER_PAGE_IDX.configurationPage);
            }, SECOND);
            flush();
        }));

        it('it should goToPageForm for joining of multiplayer game', () => {
            component.goToPageForm('join');
            expect(component.createMultiplayer).toBeFalse();
            expect(component.formPageButtonActive).toBeTrue();
            expect(component.stepper.selectedIndex).toBe(STEPPER_PAGE_IDX.configurationPage);
        });

        it('it should not go toPageForm', () => {
            component.goToPageForm('');
            expect(component.stepper.selectedIndex).toBe(STEPPER_PAGE_IDX.gameModePage);
        });
        it('should go to waiting page', () => {
            const stepperComponent: MatStepper = fixture.debugElement.query(By.css('mat-stepper'))?.componentInstance;
            stepperComponent.selectedIndex = STEPPER_PAGE_IDX.configurationPage;
            component.currDict = { title: 'default', description: 'defaultDict description' };

            fixture.detectChanges();
            component.name.setValue('testName');
            component.createGame();
            expect(stepperComponent.selectedIndex).toBe(STEPPER_PAGE_IDX.waitingPage);
        });

        it('should not go to waiting page if theres no name', () => {
            const stepperComponent: MatStepper = fixture.debugElement.query(By.css('mat-stepper'))?.componentInstance;
            stepperComponent.selectedIndex = STEPPER_PAGE_IDX.configurationPage;
            fixture.detectChanges();
            component.currDict = { title: 'title', description: 'des' };
            component.name.setValue('');
            component.createGame();
            expect(stepperComponent.selectedIndex).toBe(STEPPER_PAGE_IDX.configurationPage);
        });
        it('should not go to waiting page if theres no dict', () => {
            const stepperComponent: MatStepper = fixture.debugElement.query(By.css('mat-stepper'))?.componentInstance;
            stepperComponent.selectedIndex = STEPPER_PAGE_IDX.configurationPage;
            component.currDict = { title: '', description: '' };
            fixture.detectChanges();
            component.name.setValue('value');
            component.createGame();
            expect(stepperComponent.selectedIndex).toBe(STEPPER_PAGE_IDX.configurationPage);
        });

        it('should go to game list page', () => {
            const stepperComponent: MatStepper = fixture.debugElement.query(By.css('mat-stepper'))?.componentInstance;
            stepperComponent.selectedIndex = STEPPER_PAGE_IDX.configurationPage;
            fixture.detectChanges();
            component.name.setValue('testName');
            component.listOfGame();
            expect(stepperComponent.selectedIndex).toBe(STEPPER_PAGE_IDX.gameListPage);
        });

        it('should not go to game list page', () => {
            const stepperComponent: MatStepper = fixture.debugElement.query(By.css('mat-stepper'))?.componentInstance;
            stepperComponent.selectedIndex = STEPPER_PAGE_IDX.configurationPage;
            fixture.detectChanges();
            component.name.setValue('');
            component.listOfGame();
            expect(stepperComponent.selectedIndex).toBe(STEPPER_PAGE_IDX.configurationPage);
        });
    });

    describe('should go back', () => {
        it('should not go back', () => {
            const stepperComponent: MatStepper = fixture.debugElement.query(By.css('mat-stepper'))?.componentInstance;
            stepperComponent.selectedIndex = STEPPER_PAGE_IDX.gameModePage;
            component.goBack();
            expect(stepperComponent.selectedIndex).toBe(STEPPER_PAGE_IDX.gameModePage);
            expect(component.name.value).toBe('');
        });

        it('should go  to gameModePage', () => {
            const stepperComponent: MatStepper = fixture.debugElement.query(By.css('mat-stepper'))?.componentInstance;
            stepperComponent.selectedIndex = STEPPER_PAGE_IDX.configurationPage;
            component.goBack();
            expect(stepperComponent.selectedIndex).toBe(STEPPER_PAGE_IDX.gameModePage);
            expect(component.name.value).toBe('');
        });

        it('should go  to configurationPage', () => {
            const stepperComponent: MatStepper = fixture.debugElement.query(By.css('mat-stepper'))?.componentInstance;
            stepperComponent.selectedIndex = STEPPER_PAGE_IDX.gameListPage;
            component.goBack();
            expect(stepperComponent.selectedIndex).toBe(STEPPER_PAGE_IDX.configurationPage);
            expect(component.name.value).toBe('');
            stepperComponent.selectedIndex = STEPPER_PAGE_IDX.waitingPage;
            component.goBack();
            expect(stepperComponent.selectedIndex).toBe(STEPPER_PAGE_IDX.configurationPage);
            expect(component.name.value).toBe('');
        });

        it('should go  to gameListPage', () => {
            const stepperComponent: MatStepper = fixture.debugElement.query(By.css('mat-stepper'))?.componentInstance;
            stepperComponent.selectedIndex = STEPPER_PAGE_IDX.confirmationPage;
            component.goBack();
            expect(stepperComponent.selectedIndex).toBe(STEPPER_PAGE_IDX.gameListPage);
            expect(component.name.value).toBe('');

            stepperComponent.selectedIndex = STEPPER_PAGE_IDX.rejectedPage;
            component.goBack();
            expect(stepperComponent.selectedIndex).toBe(STEPPER_PAGE_IDX.gameListPage);
            expect(component.name.value).toBe('');
        });

        it('should go  to configurationPage if dict does not exist and im the creator', () => {
            const stepperComponent: MatStepper = fixture.debugElement.query(By.css('mat-stepper'))?.componentInstance;
            stepperComponent.selectedIndex = STEPPER_PAGE_IDX.nonExistingDict;
            gameServiceSpy.playerId = stubGame.creator.id;

            component.goBack();
            expect(stepperComponent.selectedIndex).toBe(STEPPER_PAGE_IDX.configurationPage);
            expect(component.name.value).toBe('');
            expect(dictServiceSpy.getDictHeaders).toHaveBeenCalled();
        });

        it('should go  to configurationPage if dict does not exist and im the creator', () => {
            const stepperComponent: MatStepper = fixture.debugElement.query(By.css('mat-stepper'))?.componentInstance;
            stepperComponent.selectedIndex = STEPPER_PAGE_IDX.nonExistingDict;
            component.goBack();
            expect(stepperComponent.selectedIndex).toBe(STEPPER_PAGE_IDX.nonExistingDict);
        });
    });

    describe('should start, reject player or leaveRoom', () => {
        it('should start game', () => {
            component.startGame();
            expect(gameServiceSpy.startGame).toHaveBeenCalled();
        });

        it('should start game in solo Mode', () => {
            const stepperComponent: MatStepper = fixture.debugElement.query(By.css('mat-stepper'))?.componentInstance;
            stepperComponent.selectedIndex = STEPPER_PAGE_IDX.confirmationPage;
            fixture.detectChanges();
            component.name.setValue('testName');
            component.dict = 'default-dict';
            component.virtualPlayerName = 'virtualPlayer';
            component.currDict.title = 'default-dict';
            component.startSoloGame();
            expect(gameServiceSpy.createSoloGame).toHaveBeenCalled();
        });

        it('should not  start game in solo Mode', () => {
            const stepperComponent: MatStepper = fixture.debugElement.query(By.css('mat-stepper'))?.componentInstance;
            stepperComponent.selectedIndex = STEPPER_PAGE_IDX.confirmationPage;
            fixture.detectChanges();
            component.name.setValue('testName');
            component.dict = '';
            component.virtualPlayerName = 'virtualPlayer';
            component.currDict.title = '';
            component.startSoloGame();
            expect(gameServiceSpy.createSoloGame).not.toHaveBeenCalled();
        });
        it('should start game in solo Mode', () => {
            const stepperComponent: MatStepper = fixture.debugElement.query(By.css('mat-stepper'))?.componentInstance;
            stepperComponent.selectedIndex = STEPPER_PAGE_IDX.confirmationPage;
            fixture.detectChanges();
            component.name.setValue('');
            component.dict = 'default-dict';
            component.virtualPlayerName = 'virtualPlayer';
            component.startSoloGame();
            expect(gameServiceSpy.createGame).not.toHaveBeenCalled();
        });
        it('should reject player', () => {
            component.rejectPlayer();
            expect(gameServiceSpy.rejectPlayer).toHaveBeenCalled();
            expect(component.waiting).toBeTrue();
        });
    });

    describe('receiving websocket events', () => {
        const stubPlayer: Omit<Player, 'score'> = {
            name: 'test player',
            id: '123456789',
            completedWords: [],
            easel: [],
            isPlaying: false,
            isVirtual: false,
            hasAbandon: false,
        };

        it('should update when player join the game', fakeAsync(() => {
            gameServiceSpy.createGame.and.resolveTo();
            component.name.setValue(stubPlayer.name);
            component.currDict = { title: 'default', description: 'defaultDict description' };
            component.createGame();
            tick();
            expect(gameServiceSpy.createGame).toHaveBeenCalled();
            socketHelper.peerSideEmit('playerJoined', stubPlayer);
            setTimeout(() => {
                expect(component.waiting).toBeFalse();
                expect(component.opponent).toEqual(stubPlayer);
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- this is a test
            }, 1000);
            flush();
        }));

        it('should update when opponent left the game before accepting', () => {
            component['handleOpponentLeftEvent']();
            socketHelper.peerSideEmit('playerLeft', stubPlayer);
            expect(component.waiting).toBeTrue();
        });

        it('should update when creator left the game before accepting', () => {
            component['handleDictionnaryDeleted']();
            socketHelper.peerSideEmit('nonExistingDict');
            expect(component.nonExistingDict).toBe(true);
            expect(component.stepper.selectedIndex).toBe(STEPPER_PAGE_IDX.nonExistingDict);
        });

        it('should update when creator left the game before accepting', () => {
            component['handleCreatorLeftEvent']();
            socketHelper.peerSideEmit('playerLeft', stubPlayer);
            expect(wsServiceSpy.leaveRoom).toHaveBeenCalled();
            expect(component.stepper.selectedIndex).toBe(STEPPER_PAGE_IDX.gameListPage);
        });

        it('should tell when im rejected player join the game', () => {
            component.joinGame(stubGame.id);
            socketHelper.peerSideEmit('validName', true);
            socketHelper.peerSideEmit('rejected', stubPlayer);
            expect(component.opponent).toBe(stubPlayer);
            expect(component.reject).toBeTrue();
            expect(component.stepper.selectedIndex).toBe(STEPPER_PAGE_IDX.rejectedPage);
        });
    });

    describe('convert', () => {
        it('should change the name of function on validateVirtualPlayerName()', fakeAsync(() => {
            dictServiceSpy.getVirtualPlayerName.and.resolveTo('Thanos-Joseph');
            const virtualPlayerName = 'Maximus';
            component.virtualPlayerName = virtualPlayerName;
            component.name.setValue(virtualPlayerName);
            component.validateVirtualPlayerName();
            tick();

            setTimeout(() => {
                expect(virtualPlayerName).not.toEqual(component.virtualPlayerName);
            }, SECOND);
            flush();
        }));

        it('should not change the name of function on validateVirtualPlayerName()', () => {
            const virtualPlayerName = 'Maximus';
            component.virtualPlayerName = virtualPlayerName;

            component.name.setValue('not Virtual Player Name');
            component.validateVirtualPlayerName();
            expect(virtualPlayerName).toEqual(component.virtualPlayerName);
        });

        it('should convert the game to solo mode', fakeAsync(() => {
            dictServiceSpy.getVirtualPlayerName.and.resolveTo('Thanos-Joseph');
            component.convert();

            tick();
            setTimeout(() => {
                expect(gameServiceSpy.convertToSolo).toHaveBeenCalledWith(component.virtualPlayerName, VirtualPlayerType.debutant);
            }, SECOND);
            flush();
        }));
    });
    it('should not do a placementAleatoire si les deux joueur on le meme nom', () => {
        const games: Game[] = [stubGame];
        const joinGameSpy = spyOn(component, 'joinGame').and.returnValue();
        component.name.setValue(stubGame.creator?.name);
        component.randomPlacement(games);
        expect(joinGameSpy).not.toHaveBeenCalled();
    });

    it('should  do a placementAleatoire si les deux joueur on pas le meme nom', () => {
        const games: Game[] = [stubGame];
        const joinGameSpy = spyOn(component, 'joinGame').and.returnValue();
        component.name.setValue('Other Name');
        component.randomPlacement(games);
        expect(joinGameSpy).toHaveBeenCalledWith(stubGame.id);
    });

    it('should get right virtualPlayerName for beginner', () => {
        component.getRightVirtualPlayerName(VirtualPlayerType.debutant);
        expect(dictServiceSpy.getVirtualPlayerName).toHaveBeenCalled();
    });

    it('should get right virtualPlayerName for expert', () => {
        component.getRightVirtualPlayerName(VirtualPlayerType.expert);
        expect(dictServiceSpy.getVirtualPlayerName).toHaveBeenCalled();
    });
});
