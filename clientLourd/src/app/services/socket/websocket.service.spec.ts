import { TestBed } from '@angular/core/testing';
import { placeCommand } from '@app/utils/mocks/command';
import { stubGame } from '@app/utils/mocks/game';
import { stubPlayer } from '@app/utils/mocks/player';
import { MockSocketTestHelper } from '@app/utils/mocks/socket-test-helper';
import { Command } from '@common/command';
import { ClientEvents, ServerEvents } from '@common/websocket';
import { Socket } from 'socket.io-client';
import { WebsocketService } from './websocket.service';

const stubRoom = 'test room';

describe('SocketClientService', () => {
    let service: WebsocketService;
    let socketHelper: MockSocketTestHelper;

    beforeEach(() => {
        socketHelper = new MockSocketTestHelper();
        TestBed.configureTestingModule({});
        service = TestBed.inject(WebsocketService);
        service.socket = socketHelper as unknown as Socket<ServerEvents, ClientEvents>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return true if socket is connected', () => {
        service.socket.connected = true;
        expect(service.socketAlive()).toBeTruthy();
    });

    it('should return false if socket is not connected', () => {
        service.socket.connected = false;
        expect(service.socketAlive()).toBeFalsy();
    });

    it('should connect', () => {
        spyOn(service, 'handleSocket');
        service.connect('test');
        expect(service.handleSocket).toHaveBeenCalled();
    });

    it('should disconnect', () => {
        spyOn(service.socket, 'disconnect');
        service.disconnect();
        expect(service.socket.disconnect).toHaveBeenCalled();
    });

    describe('Receiving events', () => {
        beforeEach(() => {
            service.handleSocket();
        });

        it('should handle joinRoom event by assigning the service room property', () => {
            socketHelper.peerSideEmit('joinRoom', stubRoom);
            expect(service.room).toEqual(stubRoom);
        });
    });

    describe('Emitting events', () => {
        beforeEach(() => {
            service.room = stubRoom;
        });

        it('#joinRoom() should emit the joinRoom event', () => {
            const spy = spyOn(socketHelper, 'emit');
            service.joinRoom(stubRoom);
            expect(spy).toHaveBeenCalledWith('joinRoom', stubRoom);
        });

        it('#leaveRoom() should emit the leaveRoom event', () => {
            const spy = spyOn(socketHelper, 'emit');
            service.leaveRoom();
            expect(spy).toHaveBeenCalledWith('leaveRoom', stubRoom);
        });

        it('removeOpponent() should emit the removeOpponent event', () => {
            const spy = spyOn(socketHelper, 'emit');
            service.removeOpponent();
            expect(spy).toHaveBeenCalledWith('removeOpponent', stubRoom);
        });

        it('deleteGame() should emit the deleteGame event', () => {
            const spy = spyOn(socketHelper, 'emit');
            service.deleteGame();
            expect(spy).toHaveBeenCalledWith('deleteGame', stubRoom);
        });

        it('#abandonGame() should emit the abandonGame event', () => {
            const spy = spyOn(socketHelper, 'emit');
            service.abandonGame();
            expect(spy).toHaveBeenCalledWith('abandonGame', stubRoom);
        });

        it('#shadowPlaceLetters() should emit the shadowPlaceLetters event', () => {
            const spy = spyOn(socketHelper, 'emit');
            service.shadowPlaceLetters(placeCommand, stubGame, stubPlayer.id);
            expect(spy).toHaveBeenCalledWith('shadowPlaceLetters', placeCommand, stubGame, stubPlayer.id);
        });

        it('#requestGameUpdate() should emit the requestGameUpdate event', () => {
            const spy = spyOn(socketHelper, 'emit');
            service.requestGameUpdate();
            expect(spy).toHaveBeenCalledWith('requestGameUpdate', service.room);
        });

        it('#sendMessage() should emit the message event', () => {
            const spy = spyOn(socketHelper, 'emit');
            service.room = stubRoom;
            service.sendMessage('client message');
            expect(spy).toHaveBeenCalledWith('message', 'client message', stubRoom);
        });
        it('#sendCommand() should emit the command event', () => {
            const spy = spyOn(socketHelper, 'emit');
            service.room = stubRoom;
            const stubCommand: Command = {
                fullCommand: '!passer',
                name: 'passer',
            };
            service.sendCommand(stubCommand);
            expect(spy).toHaveBeenCalledWith('command', stubCommand, stubRoom);
        });

        it('shadowPlaceLetters() should emit the shadowPlaceLetters event', () => {
            const spy = spyOn(socketHelper, 'emit');
            service.shadowPlaceLetters(placeCommand, stubGame, stubPlayer.id);
            expect(spy).toHaveBeenCalledWith('shadowPlaceLetters', placeCommand, stubGame, stubPlayer.id);
        });

        it('requestGameUpdate() should emit the requestGameUpdate event', () => {
            service.room = stubRoom;
            const spy = spyOn(socketHelper, 'emit');
            service.requestGameUpdate();
            expect(spy).toHaveBeenCalledWith('requestGameUpdate', stubRoom);
        });

        it('updateEasel() should emit the updateEasel event', () => {
            service.room = stubRoom;
            const spy = spyOn(socketHelper, 'emit');
            service.updateEasel(stubPlayer.easel, stubPlayer.id);
            expect(spy).toHaveBeenCalledWith('updateEasel', stubPlayer.easel, stubPlayer.id, stubRoom);
        });
    });
});
