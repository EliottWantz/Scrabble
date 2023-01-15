import { ScrollingModule } from '@angular/cdk/scrolling';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '@app/modules/app-routing.module';
import { GameService } from '@app/services/game/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { WebsocketService } from '@app/services/socket/websocket.service';
import { stubGame } from '@app/utils/mocks/game';
import { stubPlayer2 } from '@app/utils/mocks/player';
import { MockSocketTestHelper } from '@app/utils/mocks/socket-test-helper';
import { Game } from '@common/game';
import { ClientEvents, ServerEvents } from '@common/websocket';
import { BehaviorSubject, of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { PlayerAbandonedComponent } from './player-abandoned.component';

describe('PlayerAbandonedComponent', () => {
    let component: PlayerAbandonedComponent;
    let fixture: ComponentFixture<PlayerAbandonedComponent>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let wsServiceSpy: jasmine.SpyObj<WebsocketService>;
    let dialog: MatDialog;
    let socketTestHelper: MockSocketTestHelper;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    beforeEach(async () => {
        socketTestHelper = new MockSocketTestHelper();
        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['init'], {
            opponent$: of(stubPlayer2),
        });
        wsServiceSpy = jasmine.createSpyObj('WebsocketService', ['deleteGame'], {
            socket: socketTestHelper as unknown as Socket<ServerEvents, ClientEvents>,
        });
        gameServiceSpy = jasmine.createSpyObj('GameService', [], {
            game$: new BehaviorSubject<Game>(stubGame),
            wsService: wsServiceSpy,
        });
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule.withRoutes(routes),
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
            declarations: [PlayerAbandonedComponent],
            providers: [
                { provide: WebsocketService, useValue: wsServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
                { provide: PlayerService, useValue: playerServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        dialog = TestBed.inject(MatDialog);
        playerServiceSpy = TestBed.inject(PlayerService) as jasmine.SpyObj<PlayerService>;
        fixture = TestBed.createComponent(PlayerAbandonedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close modal when clicking Continuer', () => {
        const spy = spyOn(dialog, 'closeAll').and.callThrough();
        const continueButton = fixture.debugElement.nativeElement.querySelector('.continue');
        continueButton.click();
        expect(spy).toHaveBeenCalled();
    });

    it('should close modal and leave the game when clicking Quitter', () => {
        const spy = spyOn(dialog, 'closeAll').and.callThrough();
        // const wsSpy = spyOn(wsServiceSpy, 'deleteGame');
        const quitterButton = fixture.debugElement.nativeElement.querySelector('.leave');
        quitterButton.click();
        expect(spy).toHaveBeenCalled();
        expect(wsServiceSpy.deleteGame).toHaveBeenCalled();
    });
});
