import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { EaselService } from '@app/services/easel/easel.service';
import { EventBusService } from '@app/services/events/event-bus.service';
import { KeyboardArrows } from '@app/utils/enums/direction';
import { KeyboardArrowKey } from '@app/utils/types/keyboard-arrows';
import { Letter } from '@common/grid/node';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-easel',
    templateUrl: './game-easel.component.html',
    styleUrls: ['./game-easel.component.scss'],
})
export class GameEaselComponent implements OnDestroy {
    @ViewChild('easelContainer') easelContainer: ElementRef<HTMLDivElement>;
    easelSub: Subscription;
    keyPressedSub: Subscription;
    mouseWheelSub: Subscription;

    constructor(public easelService: EaselService, private eventBus: EventBusService) {
        this.easelSub = this.easelService.init();
        this.keyPressedSub = this.eventBus.subscribe('keyPressed', (key) => {
            this.handleKeyPressed(key as string);
        });
        this.mouseWheelSub = this.eventBus.subscribe('mouseWheel', (deltaY) => {
            this.handleMouseWheel(deltaY as number);
        });
    }

    @HostListener('document:click', ['$event'])
    onClickOut(event: MouseEvent): void {
        if (!this.easelContainer.nativeElement.contains(event.target as Node)) this.easelService.resetAllSelectedLetters();
    }

    ngOnDestroy(): void {
        this.easelSub.unsubscribe();
        this.keyPressedSub.unsubscribe();
        this.mouseWheelSub.unsubscribe();
    }

    onClick(letter: Letter): void {
        this.easelService.updateManipulationLetter(letter);
    }

    onRightClick(event: MouseEvent, letter: Letter): void {
        event.preventDefault();
        this.easelService.updateExchangeLetters(letter);
    }

    private handleKeyPressed(key: string): void {
        if ((key as KeyboardArrowKey) in KeyboardArrows) this.handleKeyboardArrows(key);
        else this.handleKeyboardLetters(key);
    }

    private handleKeyboardArrows(key: string): void {
        this.easelService.moveLetter(KeyboardArrows[key as KeyboardArrowKey]);
    }

    private handleKeyboardLetters(key: string): void {
        if (!this.easelService.hasLetter(key as string)) return this.easelService.resetAllSelectedLetters();
        const letter = this.easelService.getLetter(key as string) as Letter;
        this.easelService.updateManipulationLetter(letter);
    }

    private handleMouseWheel(deltaY: number): void {
        if (deltaY > 0) this.easelService.moveLetter('Right');
        else this.easelService.moveLetter('Left');
    }
}
