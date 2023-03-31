// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { MatCardModule } from '@angular/material/card';
// import { MatDialogModule } from '@angular/material/dialog';
// import { By } from '@angular/platform-browser';
// import { WelcomeButtonComponent } from '@app/components/welcome-button/welcome-button.component';
// import { MainPageComponent } from '@app/pages/main-page/main-page.component';

// describe('MainPageComponent', () => {
//     let component: MainPageComponent;
//     let fixture: ComponentFixture<MainPageComponent>;

//     beforeEach(async () => {
//         await TestBed.configureTestingModule({
//             imports: [MatDialogModule, MatCardModule],
//             declarations: [MainPageComponent, WelcomeButtonComponent],
//         }).compileComponents();
//     });

//     beforeEach(() => {
//         fixture = TestBed.createComponent(MainPageComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     it("should have as title 'Scrabble'", () => {
//         expect(component.title).toEqual('Scrabble');
//     });

//     it('Title Should be in middle', () => {
//         const css = fixture.debugElement.query(By.css('.justified-center')).nativeElement;
//         expect(getComputedStyle(css).alignItems).toEqual('center');
//     });

//     it('should call openDialog method', () => {
//         const spy = spyOn(component.dialog, 'open');
//         component.openParameterDialog('Classic');
//         expect(spy).toHaveBeenCalled();
//     });

//     it('should call openDialog method', () => {
//         const spy = spyOn(component.dialog, 'open');
//         component.openParameterDialog('Log2990');
//         expect(spy).toHaveBeenCalled();
//     });

//     it('should call openDialog method', () => {
//         const spy = spyOn(component.dialog, 'open');
//         component.openScoreDialog();
//         expect(spy).toHaveBeenCalled();
//     });
//     it('should call openDialog method', () => {
//         const spy = spyOn(component.dialog, 'open');
//         component.openAboutUsDialog();
//         expect(spy).toHaveBeenCalled();
//     });
// });
