import { PlayableWord } from '@common/clue';

export enum CommandName {
    Place = 'placer',
    Exchange = 'échanger',
    Skip = 'passer',
    Reserve = 'réserve',
    Help = 'aide',
    Hint = 'indice',
}

export enum CommandError {
    Syntax = 'syntax',
    Impossible = 'impossible',
    Invalid = 'invalid',
    GameDone = 'gameDone',
}

export interface Command {
    fullCommand: string;
    name: string;
}

export interface PlaceCommand extends Command {
    row: string;
    column: number;
    direction: string;
    word: string;
    wordsInDictionary: boolean;
}

export interface ExchangeCommand extends Command {
    letters: string;
}

export interface ClueCommand extends Command {
    playableWords: PlayableWord[];
}

export interface HelpCommand extends Command {
    message: string;
}
