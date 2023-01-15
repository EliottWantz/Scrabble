import { Injectable } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
import { PlayableWord } from '@common/clue';
import { ClueCommand, Command, CommandError, CommandName, ExchangeCommand, PlaceCommand } from '@common/command';
import { Game } from '@common/game';
import { Direction } from '@common/grid/direction';
import { MAX_ROW_INDEX, ROW_INDEX } from '@common/grid/row-index';

@Injectable({
    providedIn: 'root',
})
export class CommandService {
    inputCommand: string;
    game: Game;
    constructor(private gameService: GameService) {}

    async throwsError(input: string): Promise<CommandError | undefined> {
        this.inputCommand = input.trim();
        this.gameService.game$.subscribe((game) => (this.game = game));
        if (this.game.hasEnded) return CommandError.GameDone;
        const commandWords = this.inputCommand.slice(1).split(' ');
        return this.commandErrorController(commandWords);
    }

    parseCommand(input: string): Command | undefined {
        this.inputCommand = input.trim();
        const commandWords = this.inputCommand.slice(1).split(' ');
        switch (commandWords[0]) {
            case 'placer':
                return this.parsePlaceCommand(commandWords);
            case 'échanger':
                return this.parseExchangeCommand(commandWords);
            case 'passer':
                return this.parseSkipCommand(commandWords[0]);
            case 'indice':
                return this.parseClueCommand(commandWords[0]);
            case 'réserve':
                return this.parseReserveCommand(commandWords[0]);
            case 'aide':
                return this.parseHelpCommand(commandWords[0]);
            default:
                return;
        }
    }

    private async wordValidOnGrid(word: string, row: string, column: number, direction: string): Promise<boolean> {
        const rowIndex = this.getRowToNumber(row);
        let start: number;
        if (direction === Direction.Vertical) {
            start = rowIndex;
        } else {
            start = column;
        }
        if (this.isOutOfBounds(start, word.length)) return false;
        return true;
    }

    private isOutOfBounds(start: number, wordLength: number): boolean {
        return start + wordLength > MAX_ROW_INDEX;
    }

    private getRowToNumber(row: string): number {
        return ROW_INDEX.get(row) as number;
    }
    private async commandErrorController(commandWords: string[]) {
        let isValid: boolean;

        switch (commandWords[0]) {
            case CommandName.Place:
                if (commandWords.length !== 3) return CommandError.Syntax;
                isValid = await this.validatePlaceCommand(commandWords.slice(1, 3));
                return isValid ? undefined : CommandError.Syntax;
            case CommandName.Exchange:
                if (commandWords.length !== 2) return CommandError.Syntax;
                isValid = this.validateExchangeCommand(commandWords[1]);
                return isValid ? undefined : CommandError.Syntax;
            case CommandName.Skip:
                if (commandWords.length !== 1) return CommandError.Syntax;
                return undefined;
            case CommandName.Hint:
                if (commandWords.length !== 1) return CommandError.Syntax;
                return undefined;
            case CommandName.Reserve:
                if (commandWords.length !== 1) return CommandError.Syntax;
                return undefined;
            case CommandName.Help:
                if (commandWords.length !== 1) return CommandError.Syntax;
                return undefined;
            default:
                return CommandError.Invalid;
        }
    }
    private validateNumberOfCaps(word: string): boolean {
        let nbCapitalLetters = 0;
        for (const letter of word) {
            if (letter === letter.toUpperCase()) nbCapitalLetters++;
            if (nbCapitalLetters > 2) return false;
        }
        return true;
    }
    private validateWordIfLowerCase(word: string): boolean {
        const wordLowerCase = word.toLowerCase();
        return /^([a-zàâäéèêëïîôöùûüÿçæœ]+)$/.test(wordLowerCase) ? true : false;
    }
    private getAppropriateRegex(word: string): RegExp {
        return word.length === 1 ? /^([a-o])([1-9]|1[0-5]?)([vh]?)$/ : /^([a-o])([1-9]|1[0-5]?)([vh])$/;
    }
    private validatePositionAndDirection(positionAndDirection: string, regex: RegExp): boolean {
        return regex.test(positionAndDirection) ? true : false;
    }

    private separatePlaceCommand(positionAndDirection: string, word: string): [string, number, string] {
        const regex = this.getAppropriateRegex(word);
        const regexMatch = regex.exec(positionAndDirection) as RegExpExecArray;
        const row = regexMatch[1];
        const column = parseInt(regexMatch[2], 10);
        return word.length > 1 ? [row, column, regexMatch[3]] : [row, column, 'h'];
    }

    private async validatePlaceCommand([positionAndDirection, word]: string[]): Promise<boolean> {
        if (!this.validateNumberOfCaps(word)) return false;
        if (!this.validateWordIfLowerCase(word)) return false;

        const wordLowerCase = word.toLowerCase();
        const regex = this.getAppropriateRegex(wordLowerCase);
        if (!this.validatePositionAndDirection(positionAndDirection, regex)) return false;

        const [row, column, direction] = this.separatePlaceCommand(positionAndDirection, word);
        const wordValidOnGrid = await this.wordValidOnGrid(wordLowerCase, row, column, direction);
        if (!wordValidOnGrid) return false;

        return true;
    }

    private validateExchangeCommand(letters: string): boolean {
        return /^([a-z|*]){1,7}$/.test(letters);
    }

    private parsePlaceCommand([name, positionAndDirection, word]: string[]): PlaceCommand {
        const [row, column, direction] = this.separatePlaceCommand(positionAndDirection, word);
        const placeCommand: PlaceCommand = {
            fullCommand: this.inputCommand,
            name,
            row,
            column,
            direction,
            word,
            wordsInDictionary: true,
        };
        return placeCommand;
    }

    private parseExchangeCommand([name, letters]: string[]): ExchangeCommand {
        return { fullCommand: this.inputCommand, name, letters };
    }

    private parseSkipCommand(commandWord: string): Command {
        const passerCommand: Command = {
            fullCommand: this.inputCommand,
            name: commandWord,
        };
        return passerCommand;
    }

    private parseClueCommand(commandWord: string): ClueCommand {
        const clueCommand: ClueCommand = {
            fullCommand: this.inputCommand,
            name: commandWord,
            playableWords: [] as PlayableWord[],
        };
        return clueCommand;
    }

    private parseReserveCommand(commandWord: string): Command {
        const reserveCommand: Command = {
            fullCommand: this.inputCommand,
            name: commandWord,
        };
        return reserveCommand;
    }

    private parseHelpCommand(commandWord: string): Command {
        const helpCommand: Command = {
            fullCommand: this.inputCommand,
            name: commandWord,
        };
        return helpCommand;
    }
}
