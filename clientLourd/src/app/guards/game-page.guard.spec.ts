import { TestBed } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { WebsocketService } from '@app/services/socket/websocket.service';
import { StorageService } from '@app/services/storage/storage.service';
import { stubGame } from '@app/utils/mocks/game';
import { MockSocketTestHelper } from '@app/utils/mocks/socket-test-helper';
import { ClientEvents, ServerEvents } from '@common/websocket';
import { Observable, of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { GamePageGuard } from './game-page.guard';

describe('GamePageGuardGuard', () => {
    let guard: GamePageGuard;
    let commServiceSpy: jasmine.SpyObj<CommunicationService>;
    let wsServiceSpy: jasmine.SpyObj<WebsocketService>;
    let socketTestHelper: MockSocketTestHelper;

    beforeEach(() => {
        socketTestHelper = new MockSocketTestHelper();
        wsServiceSpy = jasmine.createSpyObj('WebsocketService', ['socketAlive'], {
            socket: socketTestHelper as unknown as Socket<ServerEvents, ClientEvents>,
        });
        commServiceSpy = jasmine.createSpyObj('CommunicationService', ['requestCheckIfPlayerInGame']);
        TestBed.configureTestingModule({
            providers: [
                { provide: WebsocketService, useValue: wsServiceSpy },
                { provide: CommunicationService, useValue: commServiceSpy },
            ],
        });
        guard = TestBed.inject(GamePageGuard);
    });

    it('should be created', () => {
        expect(guard).toBeTruthy();
    });

    it('canActivate() should return an Observable of false if player has not been in a game', (done) => {
        spyOn(StorageService, 'getCurrentGame').and.returnValue('');
        const canActivate = guard.canActivate();
        expect(canActivate).toEqual(jasmine.any(Observable));
        canActivate.subscribe((result) => {
            expect(result).toBe(false);
            done();
        });
    });

    it('canActivate() should return the response of requestCheckIfPlayerInGame() if player has not been in a game and disconnected', (done) => {
        spyOn(StorageService, 'getCurrentGame').and.returnValue(stubGame.id);
        wsServiceSpy.socketAlive.and.returnValue(false);
        commServiceSpy.requestCheckIfPlayerInGame.and.returnValue(of(false));
        const canActivate = guard.canActivate();
        expect(commServiceSpy.requestCheckIfPlayerInGame).toHaveBeenCalled();
        expect(canActivate).toEqual(jasmine.any(Observable));
        canActivate.subscribe((result) => {
            expect(result).toEqual(false);
            done();
        });
    });

    it('canActivate() should return an Observable of true if player has been in game and did not disconnect', (done) => {
        spyOn(StorageService, 'getCurrentGame').and.returnValue(stubGame.id);
        wsServiceSpy.socketAlive.and.returnValue(true);
        const canActivate = guard.canActivate();
        expect(canActivate).toEqual(jasmine.any(Observable));
        canActivate.subscribe((result) => {
            expect(result).toEqual(true);
            done();
        });
    });
});
