/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EaselService } from '@app/services/easel/easel.service';
import { EventBusService } from '@app/services/events/event-bus.service';
import { MockEventBusTestHelper } from '@app/utils/mocks/event-bus-test-helper';
import { stubLetter } from '@app/utils/mocks/player';
import { Direction } from '@app/utils/types/keyboard-arrows';
import { Subscription } from 'rxjs';
import { GameEaselComponent } from './game-easel.component';

describe('GameEaselComponent', () => {
    let component: GameEaselComponent;
    let fixture: ComponentFixture<GameEaselComponent>;
    let easelServiceSpy: jasmine.SpyObj<EaselService>;
    let eventBusTestHelper: MockEventBusTestHelper;

    beforeEach(async () => {
        eventBusTestHelper = new MockEventBusTestHelper();
        easelServiceSpy = jasmine.createSpyObj('EaselService', [
            'init',
            'updateManipulationLetter',
            'moveLetter',
            'hasLetter',
            'resetAllSelectedLetters',
            'getLetter',
            'updateExchangeLetters',
        ]);
        easelServiceSpy.init.and.returnValue(new Subscription());
        await TestBed.configureTestingModule({
            declarations: [GameEaselComponent],
            providers: [
                { provide: EaselService, useValue: easelServiceSpy },
                { provide: EventBusService, useValue: eventBusTestHelper },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameEaselComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should subscribe to the eventBus keyPressed event and call handleKeyPressed()', () => {
        const handleKeyPressedSpy = spyOn<any>(component, 'handleKeyPressed').and.returnValue(null);
        const key = 'ArrowRight';
        eventBusTestHelper.emit('keyPressed', key);
        expect(handleKeyPressedSpy).toHaveBeenCalledWith(key);
    });

    it('should subscribe to the eventBus mouseWheel event and call handleMouseWheel()', () => {
        const handleMouseWheelSpy = spyOn<any>(component, 'handleMouseWheel').and.returnValue(null);
        const deltaY = 100;
        eventBusTestHelper.emit('mouseWheel', deltaY);
        expect(handleMouseWheelSpy).toHaveBeenCalledWith(deltaY);
    });

    it('should unsubscribe every subscriptions in ngOnDestroy', () => {
        const easelSubSpy = spyOn(component.easelSub, 'unsubscribe').and.returnValue();
        const keyPressedSubSpy = spyOn(component.keyPressedSub, 'unsubscribe').and.returnValue();
        const mouseWheelSubSpy = spyOn(component.mouseWheelSub, 'unsubscribe').and.returnValue();
        component.ngOnDestroy();
        expect(easelSubSpy).toHaveBeenCalled();
        expect(keyPressedSubSpy).toHaveBeenCalled();
        expect(mouseWheelSubSpy).toHaveBeenCalled();
    });

    it('should call resetAllSelectedLetters() when the mouse is clicked outside the easel', () => {
        component.onClickOut(new MouseEvent('click'));
        expect(easelServiceSpy.resetAllSelectedLetters).toHaveBeenCalled();
    });

    it('should not call resetAllSelectedLetters() when the mouse is not clicked outside the easel', () => {
        spyOn(component.easelContainer.nativeElement, 'contains').and.returnValue(true);
        component.onClickOut(new MouseEvent('click'));
        expect(easelServiceSpy.resetAllSelectedLetters).not.toHaveBeenCalled();
    });

    it('onClick() should call updateManipulationLetter() from easelService', () => {
        component.onClick(stubLetter);
        expect(easelServiceSpy.updateManipulationLetter).toHaveBeenCalledWith(stubLetter);
    });

    it('onRightClick() should call updateExchangeLetters() and prevent default event handler', () => {
        const event = new MouseEvent('click', {
            button: 2,
        });
        const preventDefaultSpy = spyOn(event, 'preventDefault').and.returnValue();
        component.onRightClick(event, stubLetter);
        expect(easelServiceSpy.updateExchangeLetters).toHaveBeenCalledWith(stubLetter);
        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('handleKeyPressed() should call handleKeyboardArrows() with key if it is an arrow key', () => {
        const handleKeyboardArrowsSpy = spyOn<any>(component, 'handleKeyboardArrows').and.returnValue(null);
        const key = 'ArrowRight';
        component['handleKeyPressed'](key);
        expect(handleKeyboardArrowsSpy).toHaveBeenCalledWith(key);
    });

    it('handleKeyPressed() should call handleKeyboardLetters() with key if it is not an arrow key', () => {
        const handleKeyboardLettersSpy = spyOn<any>(component, 'handleKeyboardLetters').and.returnValue(null);
        const key = 'a';
        component['handleKeyPressed'](key);
        expect(handleKeyboardLettersSpy).toHaveBeenCalledWith(key);
    });

    it('handleKeyboardArrows() should call moveLetter() from easelService with the direction', () => {
        const key = 'ArrowRight';
        const direction: Direction = 'Right';
        component['handleKeyboardArrows'](key);
        expect(easelServiceSpy.moveLetter).toHaveBeenCalledWith(direction);
    });

    it('handleKeyboardLetters() should call resetAllSelectedLetters() from easelService if key is not a letter in easel', () => {
        easelServiceSpy.hasLetter.and.returnValue(false);
        const key = 'a';
        component['handleKeyboardLetters'](key);
        expect(easelServiceSpy.resetAllSelectedLetters).toHaveBeenCalled();
        expect(easelServiceSpy.updateManipulationLetter).not.toHaveBeenCalled();
    });

    it('handleKeyboardLetters() should call updateManipulationLetter() from easelService if key is a letter in easel', () => {
        easelServiceSpy.hasLetter.and.returnValue(true);
        easelServiceSpy.getLetter.and.returnValue(stubLetter);
        const key = 'a';
        component['handleKeyboardLetters'](key);
        expect(easelServiceSpy.resetAllSelectedLetters).not.toHaveBeenCalled();
        expect(easelServiceSpy.updateManipulationLetter).toHaveBeenCalledWith(stubLetter);
    });

    it('handleMouseWheel() should call moveLetter from easelService with direction Right if deltaY is positive', () => {
        const deltaY = 100;
        component['handleMouseWheel'](deltaY);
        expect(easelServiceSpy.moveLetter).toHaveBeenCalledWith('Right');
    });

    it('handleMouseWheel() should call moveLetter from easelService with direction Left if deltaY is negative', () => {
        const deltaY = -100;
        component['handleMouseWheel'](deltaY);
        expect(easelServiceSpy.moveLetter).toHaveBeenCalledWith('Left');
    });
});
