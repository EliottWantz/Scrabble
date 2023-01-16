import { Injectable } from '@angular/core';
import { ChatMessage } from '@common/chatMessage';
import { PlayerInfo } from '@common/player';

@Injectable({
    providedIn: 'root',
})
export class StorageService {
    static getMessages(): ChatMessage[] {
        const storedMessages = sessionStorage.getItem('chatMessages');
        return storedMessages ? JSON.parse(storedMessages) : [];
    }

    static setMessages(messages: ChatMessage[]): void {
        sessionStorage.setItem('chatMessages', JSON.stringify(messages));
    }

    static getPlayerInfo(): PlayerInfo {
        const storedPlayerInfo = sessionStorage.getItem('playerInfo');
        return storedPlayerInfo ? JSON.parse(storedPlayerInfo) : {};
    }

    static setPlayerInfo(playerInfo: PlayerInfo): void {
        sessionStorage.setItem('playerInfo', JSON.stringify(playerInfo));
    }

    static getCurrentGame(): string {
        return sessionStorage.getItem('gameId') || '';
    }

    static setCurrentGame(gameId: string): void {
        sessionStorage.setItem('gameId', gameId);
    }

    static clear(): void {
        sessionStorage.clear();
    }
}
