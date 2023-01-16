/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { KeyValue } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GameService } from '@app/services/game/game.service';
import { GameMode } from '@common/game-mode';
import { PlayerScore } from '@common/player-score';
import { HighscoresComponent } from './highscores.component';

describe('HighscoresComponent', () => {
    const mockScoreMap: Map<number, string[]> = new Map([[100, ['Schumaner']]]);
    const mockPlayerScore: PlayerScore = {
        name: 'Schumaner',
        score: 100,
    };

    let dialog: MatDialog;

    let component: HighscoresComponent;
    let fixture: ComponentFixture<HighscoresComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;

    beforeEach(async () => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['fetchScores']);

        await TestBed.configureTestingModule({
            declarations: [HighscoresComponent],
            imports: [MatDialogModule, MatStepperModule, BrowserAnimationsModule, MatCardModule],
            providers: [{ provide: GameService, useValue: gameServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;

        dialog = TestBed.inject(MatDialog);

        fixture = TestBed.createComponent(HighscoresComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should close modal', () => {
        const spy = spyOn(dialog, 'closeAll').and.callThrough();
        component.closeModal();
        expect(spy).toHaveBeenCalled();
    });
    it('should change mode to CLASSIc MODE', async () => {
        gameServiceSpy.fetchScores.and.resolveTo([mockPlayerScore]);
        await component.changeMode(true);

        expect(gameServiceSpy.fetchScores).toHaveBeenCalledWith(GameMode.Classic);

        expect(component.classicScores).toEqual(mockScoreMap);
    });

    it('should change mode to Log2990 Mode ', async () => {
        gameServiceSpy.fetchScores.and.resolveTo([mockPlayerScore]);
        await component.changeMode(false);
        expect(gameServiceSpy.fetchScores).toHaveBeenCalledWith(GameMode.Log2990);

        expect(component.logScores).toEqual(mockScoreMap);
    });

    it('changeMode should set server available to false if there is no connection with the server ', async () => {
        gameServiceSpy.fetchScores.and.resolveTo(undefined);
        await component.changeMode(false);
        expect(component.isServerAvailable).toBeFalsy();
    });

    it('assignScores should set the correct map ', async () => {
        const players: PlayerScore[] = [
            {
                name: 'Schumaner',
                score: 100,
            },
            {
                name: 'Bob',
                score: 100,
            },
        ];
        component.isClassicScoreChosen = true;

        component['assignScores'](players);
        expect(component.classicScores).toBeInstanceOf(Map);
    });

    it('sortDescending should return -1 if the old score is bigger than the new score', async () => {
        const old: KeyValue<number, string[]> = {
            key: 100,
            value: ['bob'],
        };
        const nw: KeyValue<number, string[]> = {
            key: 90,
            value: ['joe'],
        };
        const result = component.sortDescending(old, nw);
        expect(result).toEqual(-1);
    });

    it('sortDescending should return 1 if the old score is smaller than the new score', async () => {
        const old: KeyValue<number, string[]> = {
            key: 90,
            value: ['bob'],
        };
        const nw: KeyValue<number, string[]> = {
            key: 200,
            value: ['joe'],
        };
        const result = component.sortDescending(old, nw);
        expect(result).toEqual(1);
    });
});
