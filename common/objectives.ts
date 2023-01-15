export enum ObjectiveType {
    Private = 'Private',
    Public = 'Public',
}

export interface Objective {
    name: string;
    fullName: string;
    points: number;
    isCompleted: boolean;
    type?: ObjectiveType;
}

export enum ObjectiveName {
    Palindrome = 'Palindrome',
    FirstTo50 = '50 points',
    TripleSameLetter = '3 times same letters',
    TripleVowels = '3 vowels',
    StartEnd = 'Start finish same letter',
    Word20Points = 'Form 20 point word',
    FormScrabble = 'Form word Scrabble',
    WordOnGrid = 'Form word already on board',
}
