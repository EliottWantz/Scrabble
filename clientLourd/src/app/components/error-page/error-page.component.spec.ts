import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorPageComponent } from './error-page.component';

describe('ErrorPageComponent', () => {
    let dialog: MatDialog;

    let component: ErrorPageComponent;
    let fixture: ComponentFixture<ErrorPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ErrorPageComponent],
            imports: [MatDialogModule, BrowserAnimationsModule],
        }).compileComponents();
    });

    beforeEach(() => {
        dialog = TestBed.inject(MatDialog);

        fixture = TestBed.createComponent(ErrorPageComponent);
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
});
