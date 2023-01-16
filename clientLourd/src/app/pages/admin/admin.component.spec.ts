/* eslint-disable dot-notation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { GameService } from '@app/services/game/game.service';
import { WebsocketService } from '@app/services/socket/websocket.service';
import { stubVirtualPlayerName } from '@app/utils/mocks/admin';
import { MockSocketTestHelper } from '@app/utils/mocks/socket-test-helper';
import { VirtualPlayerType } from '@common/virtualPlayer';
import { Socket } from 'socket.io-client';
import { AdminComponent } from './admin.component';

describe('AdminComponent', () => {
    let dictionaryServiceSpy: jasmine.SpyObj<DictionaryService>;
    let component: AdminComponent;
    let fixture: ComponentFixture<AdminComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let wsServiceSpy: jasmine.SpyObj<WebsocketService>;
    let socketHelper: MockSocketTestHelper;
    const stubGameId = 'abcdefghijklmnopqrstuvwxyz';
    beforeEach(async () => {
        socketHelper = new MockSocketTestHelper();

        dictionaryServiceSpy = jasmine.createSpyObj('DictionaryService', [
            'getDictionaries',
            'getDictionary',
            'uploadDictionary',
            'verifyDictionaryTitleAvailability',
            'init',
            'renameVirtualPlayer',
            'resetSettings',
            'deleteVirtualPlayer',
            'deleteDictionary',
            'addNewVirtualPlayer',
            'modifyDictionary',
            'getVirtualPlayerNames',
        ]);
        wsServiceSpy = jasmine.createSpyObj('WebsocketService', ['connect'], {
            socket: socketHelper as unknown as Socket,
            room: stubGameId,
        });

        gameServiceSpy = jasmine.createSpyObj('GameService', ['init'], {
            wsService: wsServiceSpy,
        });
        await TestBed.configureTestingModule({
            declarations: [AdminComponent],
            imports: [BrowserAnimationsModule, MatDialogModule],
            providers: [
                { provide: DictionaryService, useValue: dictionaryServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminComponent);
        gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
        wsServiceSpy = TestBed.inject(WebsocketService) as jasmine.SpyObj<WebsocketService>;
        component = fixture.componentInstance;
        dictionaryServiceSpy.getVirtualPlayerNames.and.resolveTo([stubVirtualPlayerName]);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit() should initialize currentActiveName as the first on the list ', () => {
        spyOn(component, 'getVirtualPlayerName').and.resolveTo();
        component.virtualPlayerName = [stubVirtualPlayerName];
        component.ngOnInit();
        expect(component.currentActive).toBeDefined();
    });
    it('should get Virtual Player name', async () => {
        dictionaryServiceSpy.getVirtualPlayerNames.and.resolveTo([stubVirtualPlayerName]);
        await component.getVirtualPlayerName(VirtualPlayerType.debutant);
        expect(component.virtualPlayerName).toEqual([stubVirtualPlayerName]);
    });

    it('renameVirtualPlayer should call dictionnaryServiceMethods', () => {
        dictionaryServiceSpy.renameVirtualPlayer.and.returnValue();
        component.renameVirtualPlayer('oldName', 'newName');
        expect(dictionaryServiceSpy.renameVirtualPlayer).toHaveBeenCalled();
    });

    it('reset should call dictionnaryServiceMethods', () => {
        dictionaryServiceSpy.resetSettings.and.returnValue();
        component.reset();
        expect(dictionaryServiceSpy.resetSettings).toHaveBeenCalled();
    });

    it('deleteVirtualPlayer should call dictionnaryServiceMethods', () => {
        dictionaryServiceSpy.deleteVirtualPlayer.and.returnValue();
        component.virtualPlayerType = VirtualPlayerType.debutant;
        component.deleteVirtualPlayer('name');
        expect(dictionaryServiceSpy.deleteVirtualPlayer).toHaveBeenCalled();
    });

    it('deleteDict should call dictionnaryServiceMethods', () => {
        dictionaryServiceSpy.deleteDictionary.and.returnValue();
        component.currDict = 'not Default';
        component.deleteDictionary();
        expect(dictionaryServiceSpy.deleteDictionary).toHaveBeenCalled();
    });

    it('should not addNewVirtualPlayer if theres errors', () => {
        dictionaryServiceSpy.deleteVirtualPlayer.and.returnValue();
        component.virtualPlayerName = [stubVirtualPlayerName];
        component.newVirtualPlayerName.setValue(stubVirtualPlayerName.name);
        component.addNewVirtualPlayer();
        expect(dictionaryServiceSpy.addNewVirtualPlayer).not.toHaveBeenCalled();
    });

    it('should addNewVirtualPlayer if theres no errors', () => {
        dictionaryServiceSpy.deleteVirtualPlayer.and.returnValue();
        component.virtualPlayerName = [stubVirtualPlayerName];
        component.newVirtualPlayerName.setValue('different name');
        component.addNewVirtualPlayer();
        expect(dictionaryServiceSpy.addNewVirtualPlayer).toHaveBeenCalled();
    });

    it('should not modifyDictbyName if theres errors', () => {
        dictionaryServiceSpy.modifyDictionary.and.returnValue();
        dictionaryServiceSpy.dictHeaders = [
            { title: 'default', description: '' },
            { title: 'not default', description: '' },
        ];
        component.newName.setValue('default');
        component.modifyDictionary();
        expect(dictionaryServiceSpy.modifyDictionary).not.toHaveBeenCalled();
    });

    it('should modifyDictionary if theres no errors', () => {
        dictionaryServiceSpy.modifyDictionary.and.returnValue();
        dictionaryServiceSpy.dictHeaders = [
            { title: 'default', description: '' },
            { title: 'not default', description: '' },
        ];
        component.currDict = 'not Default';

        component.newName.setValue('different name');
        component.modifyDictionary();
        expect(dictionaryServiceSpy.modifyDictionary).toHaveBeenCalled();
    });

    it('should handle virtualPlayer Name Change ', () => {
        component['handleVirtualPlayerChange']();
        socketHelper.peerSideEmit('virtualPlayerChange', [stubVirtualPlayerName]);
        expect(component.newVirtualPlayerName.value).toEqual('');
    });

    it('should handle new Dictionnary Change ', () => {
        component['handleNewDict']();
        socketHelper.peerSideEmit('newDict', [
            { title: 'default', description: '' },
            { title: 'change dict', description: '' },
        ]);
        expect(component.newDescription.value).toEqual('');
    });
});
