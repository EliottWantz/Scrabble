import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { TimerPipe } from '@app/pipes/timer.pipe';
import { GameService } from '@app/services/game/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { TimerService } from '@app/services/timer/timer.service';
import { BoardMock } from '@app/utils/mocks/board';
import { OBJECTIVE_STUB_1, stubGame } from '@app/utils/mocks/game';
import { GameEaselMock } from '@app/utils/mocks/game-easel';
import { stubPlayer, stubPlayer2 } from '@app/utils/mocks/player';
import { PlayerPanelMock } from '@app/utils/mocks/player-panel';
import { TextSliderMock } from '@app/utils/mocks/text-slider';
import { Game } from '@common/game';
import { Objective } from '@common/objectives';
import { BehaviorSubject, of } from 'rxjs';
import { PanelInformationsComponent } from './panel-informations.component';
describe('PanelInformationsComponent', () => {
    // let dialog: MatDialog;

    let component: PanelInformationsComponent;
    let fixture: ComponentFixture<PanelInformationsComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let timerServiceSpy: jasmine.SpyObj<TimerService>;

    beforeEach(async () => {
        const copyStubGame: Game = JSON.parse(JSON.stringify(stubGame));
        copyStubGame.publicObjectives = [] as Objective[];
        copyStubGame.publicObjectives.push(OBJECTIVE_STUB_1);
        gameServiceSpy = jasmine.createSpyObj('GameService', [], {
            game$: new BehaviorSubject<Game>(copyStubGame),
        });
        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['init'], {
            player$: of(stubPlayer),
            opponent$: of(stubPlayer2),
        });
        timerServiceSpy = jasmine.createSpyObj('TimerService', ['init'], {
            timer$: new BehaviorSubject(stubGame.timer),
        });
        await TestBed.configureTestingModule({
            declarations: [PanelInformationsComponent, PlayAreaComponent, TimerPipe, TextSliderMock, BoardMock, GameEaselMock, PlayerPanelMock],
            imports: [MatDialogModule, MatDialogModule, BrowserAnimationsModule],

            providers: [
                { provide: GameService, useValue: gameServiceSpy },
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: TimerService, useValue: timerServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        TestBed.inject(MatDialog);
        fixture = TestBed.createComponent(PanelInformationsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.timer$).toBeDefined();
        expect(component.lettersInReserve$).toBeDefined();
        expect(playerServiceSpy.init).toHaveBeenCalled();
    });

    it('should open quitDialog', () => {
        const spy = spyOn(component.modal, 'open');
        component.openQuitDialog();
        expect(spy).toHaveBeenCalled();
    });
});
