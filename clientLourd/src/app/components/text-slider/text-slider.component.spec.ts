import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSlider, MatSliderChange, MatSliderModule } from '@angular/material/slider';
import { By } from '@angular/platform-browser';
import { GridService } from '@app/services/grid/grid.service';
import { TextSliderComponent } from './text-slider.component';

describe('TextSliderComponent', () => {
    let component: TextSliderComponent;
    let fixture: ComponentFixture<TextSliderComponent>;
    let gridServiceSpy: jasmine.SpyObj<GridService>;

    beforeEach(async () => {
        gridServiceSpy = jasmine.createSpyObj('GridService', ['renderRect']);
        await TestBed.configureTestingModule({
            declarations: [TextSliderComponent],
            imports: [MatSliderModule],
            providers: [{ provide: GridService, useValue: gridServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        gridServiceSpy = TestBed.inject(GridService) as jasmine.SpyObj<GridService>;
        fixture = TestBed.createComponent(TextSliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('changeTextValue should not modified the font size when the event value is null', () => {
        const initialFontSize = gridServiceSpy.fontTileSize;
        const slider: MatSlider = fixture.debugElement.query(By.css('mat-slider'))?.componentInstance;
        const mockSliderChange = { source: slider, value: null };
        const sliderChangeEvent: MatSliderChange = mockSliderChange;
        component.changeTextValue(sliderChangeEvent);
        expect(gridServiceSpy.fontTileSize).toEqual(initialFontSize);
    });

    it('changeTextValue should update the initial font size when the slider thumb moves', () => {
        const expectedFontSize = 9;
        const slider: MatSlider = fixture.debugElement.query(By.css('mat-slider'))?.componentInstance;
        const mockSliderChange = { source: slider, value: expectedFontSize };
        const sliderChangeEvent: MatSliderChange = mockSliderChange;
        component.changeTextValue(sliderChangeEvent);
        expect(gridServiceSpy.fontTileSize).toEqual(expectedFontSize);
    });

    it('fontTileSize should not equal initial font size when the slider thumb moves', () => {
        const initialFontSize = gridServiceSpy.fontTileSize;
        const slider: MatSlider = fixture.debugElement.query(By.css('mat-slider'))?.componentInstance;
        const mockSliderChange = { source: slider, value: 9 };
        const sliderChangeEvent: MatSliderChange = mockSliderChange;
        component.changeTextValue(sliderChangeEvent);
        expect(gridServiceSpy.fontTileSize).not.toEqual(initialFontSize);
    });
});
