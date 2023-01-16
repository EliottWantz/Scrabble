import { TestBed } from '@angular/core/testing';
import { chatMessages } from '@app/utils/mocks/chat';
import { stubPlayerInfo } from '@app/utils/mocks/player';
import { ChatMessage } from '@common/chatMessage';
import { PlayerInfo } from '@common/player';
import { StorageService } from './storage.service';

describe('StorageService', () => {
    let service: StorageService;
    let stubMessages: ChatMessage[];
    const stubGameId = '123456789';

    beforeEach(() => {
        stubMessages = JSON.parse(JSON.stringify(chatMessages));
        TestBed.configureTestingModule({});
        service = TestBed.inject(StorageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getMessages() should return the stored messages in session storage', () => {
        const sessionStorageSpy = spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify(stubMessages));
        const messages = StorageService.getMessages();
        expect(sessionStorageSpy).toHaveBeenCalledWith('chatMessages');
        expect(messages).toEqual(stubMessages);
    });

    it('getMessages() should return an empty array if no stored messages in session storage', () => {
        const sessionStorageSpy = spyOn(sessionStorage, 'getItem').and.returnValue(null);
        const messages = StorageService.getMessages();
        expect(sessionStorageSpy).toHaveBeenCalledWith('chatMessages');
        expect(messages).toEqual([]);
    });

    it('setMessages() should store the given messages in session storage', () => {
        const sessionStorageSpy = spyOn(sessionStorage, 'setItem');
        StorageService.setMessages(stubMessages);
        expect(sessionStorageSpy).toHaveBeenCalledWith('chatMessages', JSON.stringify(stubMessages));
    });

    it('getPlayerInfo() should return the stored player info in session storage', () => {
        const sessionStorageSpy = spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify(stubPlayerInfo));
        const playerInfo = StorageService.getPlayerInfo();
        expect(sessionStorageSpy).toHaveBeenCalledWith('playerInfo');
        expect(playerInfo).toEqual(stubPlayerInfo);
    });

    it('getPlayerInfo() should return null if no stored player info in session storage', () => {
        const sessionStorageSpy = spyOn(sessionStorage, 'getItem').and.returnValue(null);
        const playerInfo = StorageService.getPlayerInfo();
        expect(sessionStorageSpy).toHaveBeenCalledWith('playerInfo');
        expect(playerInfo).toEqual({} as PlayerInfo);
    });

    it('setPlayerInfo() should store the given player info in session storage', () => {
        const sessionStorageSpy = spyOn(sessionStorage, 'setItem');
        StorageService.setPlayerInfo(stubPlayerInfo);
        expect(sessionStorageSpy).toHaveBeenCalledWith('playerInfo', JSON.stringify(stubPlayerInfo));
    });

    it('getCurrentGame() should return the game id in session storage', () => {
        const sessionStorageSpy = spyOn(sessionStorage, 'getItem').and.returnValue(stubGameId);
        const gameId = StorageService.getCurrentGame();
        expect(sessionStorageSpy).toHaveBeenCalledWith('gameId');
        expect(gameId).toEqual(stubGameId);
    });

    it('getCurrentGame() should return empty string if no game id in session storage', () => {
        const sessionStorageSpy = spyOn(sessionStorage, 'getItem').and.returnValue(null);
        const gameId = StorageService.getCurrentGame();
        expect(sessionStorageSpy).toHaveBeenCalledWith('gameId');
        expect(gameId).toEqual('');
    });

    it('setPlayerInfo() should store the given player info in session storage', () => {
        const sessionStorageSpy = spyOn(sessionStorage, 'setItem');
        StorageService.setCurrentGame(stubGameId);
        expect(sessionStorageSpy).toHaveBeenCalledWith('gameId', stubGameId);
    });

    it('should clear session storage', () => {
        const sessionStorageSpy = spyOn(sessionStorage, 'clear');
        StorageService.clear();
        expect(sessionStorageSpy).toHaveBeenCalled();
    });
});
