import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameService } from '@app/services/game/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { stubGame } from '@app/utils/mocks/game';
import { stubPlayer, stubPlayer2 } from '@app/utils/mocks/player';
import { Game } from '@common/game';
import { GameMode } from '@common/game-mode';
import { Objective, ObjectiveType } from '@common/objectives';
import { BehaviorSubject, of } from 'rxjs';

import { ObjectivesComponent } from './objectives.component';

describe('ObjectivesComponent', () => {
    let component: ObjectivesComponent;
    let fixture: ComponentFixture<ObjectivesComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let publicObjectives: Objective[];

    beforeEach(async () => {
        gameServiceSpy = jasmine.createSpyObj('GameService', [], {
            game$: new BehaviorSubject<Game>(stubGame),
        });
        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['init'], {
            player$: of(stubPlayer),
            opponent$: of(stubPlayer2),
        });
        await TestBed.configureTestingModule({
            declarations: [ObjectivesComponent],
            providers: [
                { provide: GameService, useValue: gameServiceSpy },
                { provide: PlayerService, useValue: playerServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        publicObjectives = [
            {
                name: 'string',
                fullName: 'string',
                points: 0,
                isCompleted: true,
                type: 'Public' as ObjectiveType,
            },
        ];
        stubGame.mode = GameMode.Log2990;
        stubGame.publicObjectives = publicObjectives;
        gameServiceSpy.game$.next(stubGame);
        fixture = TestBed.createComponent(ObjectivesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(playerServiceSpy.init).toHaveBeenCalled();
    });

    it('should initialise the players on ngOnInit', () => {
        stubGame.mode = GameMode.Classic;
        gameServiceSpy.game$.next(stubGame);
        component.ngOnInit();
        expect(component.player).toBeDefined();
        expect(component.opponent).toBeDefined();
    });

    it('isOpponentObjectivesCompleted should return if the opponent Objectives is completed', () => {
        component.opponent.privateObjective = {
            name: 'string',
            fullName: 'string',
            points: 0,
            isCompleted: true,
            type: 'Private' as ObjectiveType,
        };

        const result = component.isOpponentObjectivesCompleted(component.opponent);

        expect(result).toBeTruthy();
    });
});
