import { TestBed } from '@angular/core/testing';
import { ChatService } from '@app/services/chat/chat.service';
import { PlayerService } from '@app/services/player/player.service';
import { stubLetter, stubPlayer } from '@app/utils/mocks/player';
import { Letter } from '@common/grid/node';
import { of } from 'rxjs';
import { EaselService } from './easel.service';

describe('EaselService', () => {
    let service: EaselService;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;

    let stubEasel: Letter[];

    beforeEach(() => {
        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['updateEasel'], {
            player$: of(stubPlayer),
        });
        chatServiceSpy = jasmine.createSpyObj('ChatService', ['sendCommand']);
        TestBed.configureTestingModule({
            providers: [
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: ChatService, useValue: chatServiceSpy },
            ],
        });
        service = TestBed.inject(EaselService);
        service.init();
        stubEasel = JSON.parse(JSON.stringify([stubLetter, { character: 'b', value: 2 }, stubLetter]));
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it("init() should initialize the easel whit the player's easel in playerService", () => {
        service.init();
        expect(service.easel).toEqual(stubPlayer.easel);
    });

    it('updateEasel() should call playerService updateEasel()', () => {
        service.updateEasel();
        expect(playerServiceSpy.updateEasel).toHaveBeenCalledWith(stubPlayer.easel);
    });

    it('updateManipulationLetter() should return if currentManipulationLetter is the given letter', () => {
        const resetAllSelectedLettersSpy = spyOn(service, 'resetAllSelectedLetters').and.returnValue();
        const updateEaselSpy = spyOn(service, 'updateEasel').and.returnValue();
        const letter = stubLetter;
        service.currentManipulationLetter = letter;
        service.updateManipulationLetter(letter);
        expect(resetAllSelectedLettersSpy).not.toHaveBeenCalled();
        expect(updateEaselSpy).not.toHaveBeenCalled();
    });

    it('updateManipulationLetter() should deselect all letters and only selected given letter for manipulation', () => {
        const resetAllSelectedLettersSpy = spyOn(service, 'resetAllSelectedLetters').and.returnValue();
        const updateEaselSpy = spyOn(service, 'updateEasel').and.returnValue();
        const letter = stubLetter;
        service.updateManipulationLetter(letter);
        expect(letter.selectionType).toEqual('manipulation');
        expect(resetAllSelectedLettersSpy).toHaveBeenCalled();
        expect(updateEaselSpy).toHaveBeenCalled();
    });

    it('resetAllSelectedLetters() should deselect all letters from easel', () => {
        service.resetAllSelectedLetters();
        expect(stubPlayer.easel.every((letter) => letter.selectionType === 'none')).toBeTruthy();
    });

    it('hasLetter() should return true if letter is in the easel', () => {
        expect(service.hasLetter(stubLetter.character)).toBeTruthy();
    });

    it('hasLetter() should return false if letter is not in the easel', () => {
        expect(service.hasLetter('z')).toBeFalsy();
    });

    it('getLetter() should return the letter from the easel in there is no oldSelectedLetter', () => {
        service.easel = stubEasel;
        const letter = service.getLetter(stubLetter.character);
        expect(letter).toEqual(stubLetter);
    });

    it('getLetter() should return the letter from the easel if the oldSelectedLetter is not the searchedLetter', () => {
        service.easel = stubEasel;
        service.currentManipulationLetter = service.easel[2];
        const letter = service.getLetter(stubLetter.character);
        expect(letter).toEqual(stubLetter);
    });

    it('getLetter() should return the next occurrence of the letter from the easel if the oldSelectedLetter is the searchedLetter', () => {
        service.easel = stubEasel;
        service.currentManipulationLetter = service.easel[0];
        const letter = service.getLetter(stubLetter.character);
        expect(letter).toEqual(service.easel[2]);
    });

    it('getLetter() should return wrap to the first occurrence of the letter if the oldSelectedLetter is at the end of the easel', () => {
        service.easel = stubEasel;
        service.currentManipulationLetter = service.easel[1];
        const letter = service.getLetter(stubLetter.character);
        expect(letter).toEqual(service.easel[0]);
    });

    it('moveLetter() should return if there is no currentManipulationLetter', () => {
        service.currentManipulationLetter = undefined;
        const updateEaselSpy = spyOn(service, 'updateEasel').and.returnValue();
        service.moveLetter('Left');
        expect(updateEaselSpy).not.toHaveBeenCalled();
    });

    it('moveLetter() should return if there is one letter on the easel', () => {
        const updateEaselSpy = spyOn(service, 'updateEasel').and.returnValue();
        service.currentManipulationLetter = stubLetter;
        service.moveLetter('Left');
        expect(updateEaselSpy).not.toHaveBeenCalled();
        expect(service.easel).toEqual([stubLetter]);
    });

    it('moveLetter() should return if there is no letter on the easel', () => {
        const updateEaselSpy = spyOn(service, 'updateEasel').and.returnValue();
        service.currentManipulationLetter = stubLetter;
        service.easel = [];
        service.moveLetter('Left');
        expect(updateEaselSpy).not.toHaveBeenCalled();
        expect(service.easel).toEqual([]);
    });

    it('moveLetter() should move the letter by one to the left', () => {
        service.easel = stubEasel;
        service.currentManipulationLetter = service.easel[1];
        service.moveLetter('Left');
        expect(service.easel).toEqual([{ character: 'b', value: 2 }, stubLetter, stubLetter]);
    });

    it('moveLetter() should move the letter by one to the right', () => {
        service.easel = stubEasel;
        service.currentManipulationLetter = service.easel[1];
        service.moveLetter('Right');
        expect(service.easel).toEqual([stubLetter, stubLetter, { character: 'b', value: 2 }]);
    });

    it('moveLetter() should move the letter at the start of easel if letter is at the end and direction is right', () => {
        service.easel = [stubLetter, stubLetter, { character: 'b', value: 2 }];
        service.currentManipulationLetter = service.easel[2];
        service.moveLetter('Right');
        expect(service.easel).toEqual([{ character: 'b', value: 2 }, stubLetter, stubLetter]);
    });

    it('moveLetter() should move the letter at the end of easel if letter is at the start and direction is left', () => {
        service.easel = [{ character: 'b', value: 2 }, stubLetter, stubLetter];
        service.currentManipulationLetter = service.easel[0];
        service.moveLetter('Left');
        expect(service.easel).toEqual([stubLetter, stubLetter, { character: 'b', value: 2 }]);
    });

    it('updateExchangeLetters() should remove current manipulation letter from selected state', () => {
        service.currentManipulationLetter = stubLetter;
        stubLetter.selectionType = 'manipulation';
        service.updateExchangeLetters(stubLetter);
        expect(service.currentManipulationLetter).toBeUndefined();
    });

    it('updateExchangeLetters() should remove letter from exchange letters if already selected', () => {
        service.currentManipulationLetter = undefined;
        service.exchangeLetters = [stubLetter];
        service.updateExchangeLetters(stubLetter);
        expect(service.exchangeLetters).toEqual([]);
        expect(stubLetter.selectionType).toEqual('none');
    });

    it('updateExchangeLetters() should add letter to exchange letters if not already selected', () => {
        service.currentManipulationLetter = undefined;
        service.updateExchangeLetters(stubLetter);
        expect(service.exchangeLetters).toEqual([stubLetter]);
        expect(stubLetter.selectionType).toEqual('exchange');
    });

    it('exchangeSelectedLetters() send the exchange command and reset all selected letters', () => {
        const resetAllSelectedLettersSpy = spyOn(service, 'resetAllSelectedLetters').and.returnValue();
        service.exchangeLetters = [stubLetter];
        service.exchangeSelectedLetters();
        expect(chatServiceSpy.sendCommand).toHaveBeenCalled();
        expect(resetAllSelectedLettersSpy).toHaveBeenCalled();
    });

    it('hasLetters should return whether the player has the specified letter', () => {
        expect(service.hasLetters('L', stubEasel)).toBeFalsy();
        expect(service.hasLetters('l', stubEasel)).toBeFalsy();
        stubEasel.push({ character: '*', value: 1 });
        expect(service.hasLetters('b', stubEasel)).toBeTruthy();
        expect(service.hasLetters('a', stubEasel)).toBeTruthy();
        expect(service.hasLetters('*', stubEasel)).toBeTruthy();
    });

    it('removeLetterAccent should remove the accent of a string and return it', () => {
        const letter = 'ç';
        const result = service.removeLetterAccent(letter);
        const expected = 'c';
        expect(result).toEqual(expected);
    });
});
