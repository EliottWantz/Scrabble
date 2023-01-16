import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { WelcomeButtonComponent } from './welcome-button.component';

describe('WelcomeButtonComponent', () => {
    let component: WelcomeButtonComponent;
    let fixture: ComponentFixture<WelcomeButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatCardModule],
            declarations: [WelcomeButtonComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WelcomeButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
