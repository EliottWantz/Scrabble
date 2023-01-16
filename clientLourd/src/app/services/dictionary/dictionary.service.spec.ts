/* eslint-disable @typescript-eslint/no-explicit-any */ // For testing private methods
/* eslint-disable dot-notation */ // For testing private methods
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { stubVirtualPlayerName } from '@app/utils/mocks/admin';
import { dictionaryStub } from '@app/utils/mocks/dictionary-stub';
import { SETTING_JV_NAMES } from '@common/dictionnary';
import { VirtualPlayerType } from '@common/virtualPlayer';
import { of } from 'rxjs';
import { DictionaryService } from './dictionary.service';

describe('DictionaryService', () => {
    let service: DictionaryService;
    let commServiceSpy: jasmine.SpyObj<CommunicationService>;

    beforeEach(() => {
        commServiceSpy = jasmine.createSpyObj('CommunicationService', [
            'uploadDictionary',
            'verifyDictionaryTitleAvailability',
            'getDictionariesTitles',
            'getDictionary',
            'renameVirtualPlayer',
            'deleteVirtualPlayer',
            'addNewVirtualPlayer',
            'deleteDictionary',
            'modifyDictionary',
            'resetSettings',
            'getVirtualPlayerName',
            'getVirtualPlayerNames',
            'getDictionariesHeaders',
        ]);
        commServiceSpy.getDictionariesHeaders.and.returnValue(
            of([
                { title: 'title1', description: '' },
                { title: 'title2', description: '' },
            ]),
        );
        TestBed.configureTestingModule({
            providers: [DictionaryService, { provide: CommunicationService, useValue: commServiceSpy }],
        });
        service = TestBed.inject(DictionaryService);
        service.init();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize dictionaryErrors', () => {
        expect(service.dictionaryErrors.invalidDictionaryStructure).toBeFalsy();
        expect(service.dictionaryErrors.invalidFileType).toBeFalsy();
        expect(service.dictionaryErrors.invalidJson).toBeFalsy();
        expect(service.dictionaryErrors.invalidTitle).toBeFalsy();
    });

    it('should initialize dictionaries as an empty array if commService.getDictionariesTitles() resolves to an empty array', () => {
        commServiceSpy.getDictionariesHeaders.and.returnValue(of([]));
        service.init();
        expect(service.dictHeaders).toEqual([]);
    });

    it('should get the dictionary titles from the commService', () => {
        const dictionnaryHeader = [
            { title: 'title1', description: '' },
            { title: 'title2', description: '' },
        ];
        commServiceSpy.getDictionariesHeaders.and.returnValue(of(dictionnaryHeader));
        service.init();
        expect(commServiceSpy.getDictionariesHeaders).toHaveBeenCalled();
        expect(service.dictHeaders).toEqual(dictionnaryHeader);
    });

    it('should download the dictionary', () => {
        const dictionaryName = 'dictionaryName';
        commServiceSpy.getDictionary.and.returnValue(of(dictionaryStub));
        service.downloadDictionary(dictionaryName);
        expect(commServiceSpy.getDictionary).toHaveBeenCalledWith(dictionaryName);
    });

    it('handleDictInput() should not do anything if not there is no FileList', () => {
        const resetDictionaryErrorsSpy = spyOn(service, 'resetDictionaryErrors');
        service.handleDictInput(null);
        expect(resetDictionaryErrorsSpy).not.toHaveBeenCalled();
    });

    it('handleDictInput() should not do anything if there is no files in the FileList', () => {
        const resetDictionaryErrorsSpy = spyOn(service, 'resetDictionaryErrors');
        const fileList: FileList = {
            0: null as unknown as File,
            length: 1,
            item: () => null,
        };
        service.handleDictInput(fileList);
        expect(resetDictionaryErrorsSpy).not.toHaveBeenCalled();
    });

    it('handleDictInput() should reset the dictionary errors if there is a file in the input', () => {
        const resetDictionaryErrorsSpy = spyOn(service, 'resetDictionaryErrors');
        const file = new File([], 'test.json');
        const fileList: FileList = {
            0: file,
            length: 1,
            item: () => file,
        };
        service.handleDictInput(fileList);
        expect(resetDictionaryErrorsSpy).toHaveBeenCalled();
    });

    it('handleDictInput() should not do anything if the file is not a json file', () => {
        const parseDictionarySpy = spyOn(service as any, 'parseDictionary');
        const file = new File([], 'test.txt');
        const fileList: FileList = {
            0: file,
            length: 1,
            item: () => file,
        };
        service.handleDictInput(fileList);
        expect(parseDictionarySpy).not.toHaveBeenCalled();
    });

    it('handleDictInput() should not verify the dictionary if the file is an invalid json file', fakeAsync(() => {
        const parseDictionarySpy = spyOn(service as any, 'parseDictionary').and.returnValue(Promise.resolve(null));
        const file = new File([], 'invalid.json', { type: 'application/json' });
        const fileList: FileList = {
            0: file,
            length: 1,
            item: () => file,
        };
        service.handleDictInput(fileList);
        tick();
        expect(parseDictionarySpy).toHaveBeenCalled();
    }));

    it('handleDictInput() should not verify the dictionary if the file is an empty json file', fakeAsync(() => {
        spyOn(service as any, 'parseDictionary').and.returnValue(Promise.resolve(dictionaryStub));
        const isInstanceOfDictionarySpy = spyOn(service as any, 'isInstanceOfDictionary').and.returnValue(false);
        const file = new File([], 'empty.json', { type: 'application/json' });
        const handleDictionaryUploadSpy = spyOn(service as any, 'handleDictionaryUpload');
        const fileList: FileList = {
            0: file,
            length: 1,
            item: () => file,
        };
        service.handleDictInput(fileList);
        tick();
        expect(isInstanceOfDictionarySpy).toHaveBeenCalled();
        expect(handleDictionaryUploadSpy).not.toHaveBeenCalled();
    }));

    it('handleDictInput() should not verify the dictionary if it already exists', fakeAsync(() => {
        spyOn(service as any, 'parseDictionary').and.returnValue(Promise.resolve(dictionaryStub));
        const isInstanceOfDictionarySpy = spyOn(service as any, 'isInstanceOfDictionary').and.returnValue(true);
        service.dictHeaders = [{ title: dictionaryStub.title, description: dictionaryStub.description }];
        const handleDictionaryUploadSpy = spyOn(service as any, 'handleDictionaryUpload');
        const file = new File([], 'valid.json', { type: 'application/json' });
        const fileList: FileList = {
            0: file,
            length: 1,
            item: () => file,
        };
        service.handleDictInput(fileList);
        tick();
        expect(isInstanceOfDictionarySpy).toHaveBeenCalled();
        expect(handleDictionaryUploadSpy).not.toHaveBeenCalled();
    }));

    it('handleDictInput() upload the dictionary', fakeAsync(() => {
        service.dictHeaders = [];
        spyOn(service as any, 'parseDictionary').and.returnValue(Promise.resolve(dictionaryStub));
        const isInstanceOfDictionarySpy = spyOn(service as any, 'isInstanceOfDictionary').and.returnValue(true);
        const handleDictionaryUploadSpy = spyOn(service as any, 'handleDictionaryUpload');
        const file = new File([], 'valid.json', { type: 'application/json' });
        const fileList: FileList = {
            0: file,
            length: 1,
            item: () => file,
        };
        service.handleDictInput(fileList);
        tick();
        expect(isInstanceOfDictionarySpy).toHaveBeenCalled();
        expect(service.dictionaryErrors.invalidTitle).toBeFalsy();
        expect(handleDictionaryUploadSpy).toHaveBeenCalled();
    }));

    it('handleDictionaryUpload() should not upload if there is no dictionary to upload', () => {
        service.dictionaryToUpload = null;
        service['handleDictionaryUpload']();
        expect(commServiceSpy.uploadDictionary).not.toHaveBeenCalled();
    });

    it('handleDictionaryUpload() should not upload the dictionary if it already exists', () => {
        service.dictionaryToUpload = dictionaryStub;
        commServiceSpy.uploadDictionary.and.returnValue(of(null));
        const addDictionarySpy = spyOn(service.dictHeaders, 'push');
        service['handleDictionaryUpload']();
        expect(commServiceSpy.uploadDictionary).toHaveBeenCalled();
        expect(addDictionarySpy).not.toHaveBeenCalled();
    });

    it('handleDictionaryUpload() should upload the dictionary if it does not exist', () => {
        service.dictionaryToUpload = dictionaryStub;
        commServiceSpy.uploadDictionary.and.returnValue(of(dictionaryStub));
        const addDictionarySpy = spyOn(service.dictHeaders, 'push');
        service['handleDictionaryUpload']();
        expect(commServiceSpy.uploadDictionary).toHaveBeenCalled();
        expect(addDictionarySpy).toHaveBeenCalled();
    });

    it('should reset all dictionary errors', () => {
        service.dictionaryErrors.invalidDictionaryStructure = true;
        service.dictionaryErrors.invalidFileType = true;
        service.dictionaryErrors.invalidJson = true;
        service.dictionaryErrors.invalidTitle = true;
        service.resetDictionaryErrors();
        expect(service.dictionaryErrors.invalidDictionaryStructure).toBeFalsy();
        expect(service.dictionaryErrors.invalidFileType).toBeFalsy();
        expect(service.dictionaryErrors.invalidJson).toBeFalsy();
        expect(service.dictionaryErrors.invalidTitle).toBeFalsy();
    });

    it('parseDictionary() should return null if the file cannot be read', async () => {
        const file = new File([], 'valid.json', { type: 'application/json' });
        try {
            await service['parseDictionary'](file);
        } catch (error) {
            expect(error).toBeNull();
        }
    });

    it('parseDictionary() should return null if the json file has errors', async () => {
        const file = new File(['invalid'], 'invalid.json', { type: 'application/json' });
        const dictionary = await service['parseDictionary'](file);
        expect(dictionary).toBeNull();
    });

    it('parseDictionary() should return the dictionary if the json file is valid', async () => {
        const file = new File([JSON.stringify(dictionaryStub)], 'valid.json', { type: 'application/json' });
        const dictionary = await service['parseDictionary'](file);
        expect(dictionary).toEqual(dictionaryStub);
    });

    it('should return false if object if not a dictionary', () => {
        expect(service['isInstanceOfDictionary']({})).toBeFalsy();
    });

    it('should return false if object does not have the same keys as a dictionary', () => {
        expect(service['isInstanceOfDictionary']({ key: 'value', key2: 'value2', key3: 'value3' })).toBeFalsy();
    });

    it('should return true if object is a dictionary', () => {
        expect(service['isInstanceOfDictionary'](dictionaryStub)).toBeTruthy();
    });

    it('renameVirtualPlayer() should call the comService Methods', () => {
        commServiceSpy.renameVirtualPlayer.and.returnValue(of());
        service.renameVirtualPlayer('oldName', 'newName', VirtualPlayerType.debutant);
        expect(commServiceSpy.renameVirtualPlayer).toHaveBeenCalled();
    });

    it('deleteVirtualPlayer() should call the comService Methods', () => {
        commServiceSpy.deleteVirtualPlayer.and.returnValue(of());
        service.deleteVirtualPlayer('oldName', VirtualPlayerType.debutant);
        expect(commServiceSpy.deleteVirtualPlayer).toHaveBeenCalled();
    });

    it('addNewVirtualPlayer() should call the comService Methods', () => {
        commServiceSpy.addNewVirtualPlayer.and.returnValue(of());
        service.addNewVirtualPlayer('oldName', VirtualPlayerType.debutant);
        expect(commServiceSpy.addNewVirtualPlayer).toHaveBeenCalled();
    });

    it('deleteDictionary() should call the comService Methods', () => {
        commServiceSpy.deleteDictionary.and.returnValue(of(undefined));
        service.deleteDictionary('oldName');
        expect(commServiceSpy.deleteDictionary).toHaveBeenCalled();
    });

    it('modifyDictbyName() should call the comService Methods', () => {
        commServiceSpy.modifyDictionary.and.returnValue(of(undefined));
        service.modifyDictionary('oldName', 'newName', 'new Description');
        expect(commServiceSpy.modifyDictionary).toHaveBeenCalled();
    });

    it('resetReglage() should call the comService Methods', fakeAsync(() => {
        commServiceSpy.resetSettings.and.returnValues(of(undefined));
        service.resetSettings(SETTING_JV_NAMES);
        tick();
        expect(service.waitingForConfirmation).toBeFalsy();
        expect(commServiceSpy.resetSettings).toHaveBeenCalled();
    }));

    it('getvirtualPlayerNames() should call the comService Methods', () => {
        commServiceSpy.getVirtualPlayerNames.and.returnValue(of([stubVirtualPlayerName]));
        service.getVirtualPlayerNames();
        expect(commServiceSpy.getVirtualPlayerNames).toHaveBeenCalled();
    });

    it('getVirtualPlayerName() should call the comService Methods', () => {
        commServiceSpy.getVirtualPlayerName.and.returnValue(of(stubVirtualPlayerName.name));
        service.getVirtualPlayerName(VirtualPlayerType.debutant);
        expect(commServiceSpy.getVirtualPlayerName).toHaveBeenCalled();
    });
});
