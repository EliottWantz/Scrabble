import { ScrollingModule } from '@angular/cdk/scrolling';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
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
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '@app/modules/app-routing.module';
import { GameService } from '@app/services/game/game.service';
import { WebsocketService } from '@app/services/socket/websocket.service';
import { stubGame } from '@app/utils/mocks/game';
import { BehaviorSubject, of } from 'rxjs';
import { QuitGameComponent } from './quit-game.component';

describe('QuitGameComponent', () => {
    let component: QuitGameComponent;
    let fixture: ComponentFixture<QuitGameComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let wsServiceSpy: jasmine.SpyObj<WebsocketService>;
    let dialog: MatDialog;
    let router: Router;
    beforeEach(async () => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['leaveRoom', 'abandonGame'], {
            joinableGames$: of([]),
            game$: new BehaviorSubject(stubGame),
        });
        wsServiceSpy = jasmine.createSpyObj('WebsocketService', ['leaveRoom', 'abandonGame'], {
            room: 'stubRoom',
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
            declarations: [QuitGameComponent],
            providers: [
                { provide: GameService, useValue: gameServiceSpy },
                { provide: WebsocketService, useValue: wsServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        dialog = TestBed.inject(MatDialog);
        fixture = TestBed.createComponent(QuitGameComponent);
        router = TestBed.inject(Router);
        component = fixture.componentInstance;
        fixture.detectChanges();
        router.initialNavigation();
        window.onbeforeunload = jasmine.createSpy();
        window.onbeforeunload = () => 'Oh no!';
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close modal when clicking yes', () => {
        const spy = spyOn(dialog, 'closeAll').and.callThrough();
        const quitButton = fixture.debugElement.nativeElement.querySelector('.yes');
        quitButton.click();
        expect(spy).toHaveBeenCalled();
    });

    it('should close modal when clicking no', () => {
        const spy = spyOn(dialog, 'closeAll').and.callThrough();
        const quitButton = fixture.debugElement.nativeElement.querySelector('.no');
        quitButton.click();
        expect(spy).toHaveBeenCalled();
    });

    it('should do nothing when no is clicked', fakeAsync(() => {
        const gameLocation = router.url;
        const quitButton = fixture.debugElement.nativeElement.querySelector('.no');
        quitButton.click();
        tick();
        expect(router.url).toBe(gameLocation);
    }));

    it('should leave room if click yes and game ended', fakeAsync(() => {
        gameServiceSpy.game$.value.hasEnded = true;
        const quitButton = fixture.debugElement.nativeElement.querySelector('.yes');
        quitButton.click();
        tick();
        expect(wsServiceSpy.leaveRoom).toHaveBeenCalled();
    }));

    it('should abandon game if click yes and game not ended', fakeAsync(() => {
        gameServiceSpy.game$.value.hasEnded = false;
        const quitButton = fixture.debugElement.nativeElement.querySelector('.yes');
        quitButton.click();
        tick();
        expect(wsServiceSpy.abandonGame).toHaveBeenCalled();
    }));
});
