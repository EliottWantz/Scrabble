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
import { PlayerService } from '@app/services/player/player.service';
import { stubPlayer, stubPlayer2 } from '@app/utils/mocks/player';
import { of } from 'rxjs';
import { WinGameComponent } from './win-game.component';

describe('WinGameComponent', () => {
    let component: WinGameComponent;
    let fixture: ComponentFixture<WinGameComponent>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let dialog: MatDialog;
    beforeEach(async () => {
        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['init'], {
            player$: of(stubPlayer),
            opponent$: of(stubPlayer2),
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
            declarations: [WinGameComponent],
            providers: [{ provide: PlayerService, useValue: playerServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        dialog = TestBed.inject(MatDialog);
        playerServiceSpy = TestBed.inject(PlayerService) as jasmine.SpyObj<PlayerService>;
        fixture = TestBed.createComponent(WinGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should close modal when clicking Genial', () => {
        const spy = spyOn(dialog, 'closeAll').and.callThrough();
        const quitButton = fixture.debugElement.nativeElement.querySelector('.Genial');
        quitButton.click();
        expect(spy).toHaveBeenCalled();
    });

    it('should handle win game', () => {
        const player = stubPlayer;
        player.score = 10;
        const opponent = stubPlayer2;
        opponent.score = 0;
        playerServiceSpy.player$ = of({ ...player });
        playerServiceSpy.opponent$ = of({ ...opponent });
        component.ngOnInit();
        expect(component.win).toBeTrue();
    });

    it('should handle win game', () => {
        const player = stubPlayer;
        player.score = 0;
        const opponent = stubPlayer2;
        opponent.score = 10;
        playerServiceSpy.player$ = of({ ...player });
        playerServiceSpy.opponent$ = of({ ...opponent });
        component.ngOnInit();
        expect(component.win).toBeFalse();
    });
});
