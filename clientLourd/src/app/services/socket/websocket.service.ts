import { Injectable } from '@angular/core';
import { environment } from '@app/../environments/environment';
import { Command, PlaceCommand } from '@common/command';
import { Game } from '@common/game';
import { Letter } from '@common/grid/node';
import { ClientEvents, ServerEvents } from '@common/websocket';
import { io, Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class WebsocketService {
    socket: Socket<ServerEvents, ClientEvents>;
    room: string;

    socketAlive(): boolean {
        return this.socket && this.socket.connected;
    }

    connect(playerName: string): void {
        this.socket = io(environment.wsUrl, {
            transports: ['websocket'],
            upgrade: false,
            auth: { playerName },
        });
        this.handleSocket();
    }

    disconnect(): void {
        this.socket.disconnect();
    }

    handleSocket(): void {
        this.socket.on('joinRoom', (room) => (this.room = room));
    }

    joinRoom(room: string): void {
        this.socket.emit('joinRoom', room);
    }

    leaveRoom(): void {
        this.socket.emit('leaveRoom', this.room);
    }

    removeOpponent(): void {
        this.socket.emit('removeOpponent', this.room);
    }

    deleteGame(): void {
        this.socket.emit('deleteGame', this.room);
    }

    abandonGame(): void {
        this.socket.emit('abandonGame', this.room);
    }

    sendMessage(msg: string): void {
        this.socket.emit('message', msg, this.room);
    }

    sendCommand(command: Command): void {
        this.socket.emit('command', command, this.room);
    }

    shadowPlaceLetters(placeCommand: PlaceCommand, game: Game, playerId: string): void {
        this.socket.emit('shadowPlaceLetters', placeCommand, game, playerId);
    }

    requestGameUpdate(): void {
        this.socket.emit('requestGameUpdate', this.room);
    }

    updateEasel(easel: Letter[], playerId: string): void {
        this.socket.emit('updateEasel', easel, playerId, this.room);
    }
}
