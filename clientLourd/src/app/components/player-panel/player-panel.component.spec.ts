import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameService } from '@app/services/game/game.service';
import { stubGame } from '@app/utils/mocks/game';
import { Game } from '@common/game';
import { BehaviorSubject } from 'rxjs';
import { PlayerPanelComponent } from './player-panel.component';

describe('PlayerPanelComponent', () => {
    let component: PlayerPanelComponent;
    let fixture: ComponentFixture<PlayerPanelComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;

    beforeEach(async () => {
        gameServiceSpy = jasmine.createSpyObj('GameService', [], {
            game$: new BehaviorSubject<Game>(stubGame),
        });
        await TestBed.configureTestingModule({
            declarations: [PlayerPanelComponent],
            providers: [{ provide: GameService, useValue: gameServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayerPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
