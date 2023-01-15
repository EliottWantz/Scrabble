import { Injectable } from '@angular/core';
import { ChatService } from '@app/services/chat/chat.service';
import { PlayerService } from '@app/services/player/player.service';
import { Direction } from '@app/utils/types/keyboard-arrows';
import { ExchangeCommand } from '@common/command';
import { Letter } from '@common/grid/node';
import { Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class EaselService {
    easel: Letter[];
    currentManipulationLetter?: Letter;
    exchangeLetters: Letter[];

    constructor(private playerService: PlayerService, private chatService: ChatService) {}

    init(): Subscription {
        this.exchangeLetters = [];
        return this.playerService.player$
            .pipe(
                map((player) => player.easel),
                tap((easel) => {
                    const manipulationLetter = easel.find((letter) => letter.selectionType === 'manipulation');
                    if (manipulationLetter) this.currentManipulationLetter = manipulationLetter;
                }),
            )
            .subscribe((easel) => (this.easel = easel));
    }

    updateEasel(): void {
        this.playerService.updateEasel(this.easel);
    }

    updateManipulationLetter(letter: Letter): void {
        if (this.currentManipulationLetter === letter) return;
        this.resetAllSelectedLetters();
        letter.selectionType = 'manipulation';
        this.currentManipulationLetter = letter;
        this.updateEasel();
    }

    resetAllSelectedLetters(): void {
        this.currentManipulationLetter = undefined;
        this.exchangeLetters = [];
        this.easel.forEach((letter) => (letter.selectionType = 'none'));
    }

    moveLetter(direction: Direction): void {
        if (!this.currentManipulationLetter) return;
        if (this.easel.length <= 1) return;
        const indexFrom = this.easel.indexOf(this.currentManipulationLetter);
        const indexTo = direction === 'Left' ? indexFrom - 1 : indexFrom + 1;
        if (indexTo < 0) {
            this.easel.push(this.easel.shift() as Letter);
        } else if (indexTo === this.easel.length) {
            this.easel.unshift(this.easel.pop() as Letter);
        } else {
            const letterFrom = this.easel[indexFrom];
            const letterTo = this.easel[indexTo];
            this.easel[indexFrom] = letterTo;
            this.easel[indexTo] = letterFrom;
        }
        this.updateEasel();
    }

    hasLetter(letter: string): boolean {
        const playerLetters = this.easel.map((l) => l.character);
        return playerLetters.includes(letter);
    }

    getLetter(searchedLetter: string): Letter {
        const oldSelectedLetter = this.currentManipulationLetter;
        const easelLetters = this.easel.filter((letter) => letter.character === searchedLetter);
        if (!oldSelectedLetter || oldSelectedLetter.character !== searchedLetter) return easelLetters[0];
        const oldSelectedLetterIndex = easelLetters.indexOf(oldSelectedLetter);
        const newIndex = oldSelectedLetterIndex + 1 === easelLetters.length ? 0 : oldSelectedLetterIndex + 1;
        return easelLetters[newIndex];
    }

    hasLetters(letters: string, playerEasel: Letter[]): boolean {
        const playerLetters = playerEasel.map((letter) => letter.character);
        for (const letter of letters) {
            if (letter === letter.toUpperCase() && !this.includesLetter('*', playerLetters)) return false;
            else if (letter !== letter.toUpperCase() && !this.includesLetter(letter, playerLetters)) {
                return false;
            }
            if (letter === letter.toUpperCase()) playerLetters.splice(playerLetters.indexOf('*'), 1);
            else playerLetters.splice(playerLetters.indexOf(letter), 1);
        }
        return true;
    }

    removeLetterAccent(letter: string): string {
        return letter.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    updateExchangeLetters(letter: Letter): void {
        if (this.currentManipulationLetter) {
            this.currentManipulationLetter.selectionType = 'none';
            this.currentManipulationLetter = undefined;
        }
        if (this.exchangeLetters.includes(letter)) {
            this.exchangeLetters = this.exchangeLetters.filter((l) => l !== letter);
            letter.selectionType = 'none';
        } else {
            this.exchangeLetters.push(letter);
            letter.selectionType = 'exchange';
        }
        this.updateEasel();
    }

    exchangeSelectedLetters(): void {
        const letters = this.exchangeLetters.map((l) => l.character).join('');
        const exchangeCommand: ExchangeCommand = {
            fullCommand: '!échanger ' + letters,
            name: 'échanger',
            letters,
        };
        this.resetAllSelectedLetters();
        this.chatService.sendCommand(exchangeCommand);
    }

    private includesLetter(letter: string, playerLetters: string[]): boolean {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- We should not create a constant for the sake of the test
        return playerLetters.indexOf(letter) !== -1;
    }
}
