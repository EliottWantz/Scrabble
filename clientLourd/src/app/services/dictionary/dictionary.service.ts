import { Injectable } from '@angular/core';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { DictHeaders, Dictionary, DictionaryErrors } from '@common/dictionary';
import { VirtualPlayerName } from '@common/player';
import { VirtualPlayerType } from '@common/virtualPlayer';

@Injectable({
    providedIn: 'root',
})
export class DictionaryService {
    dictHeaders: DictHeaders[];
    dictionaryErrors: DictionaryErrors;
    dictionaryToUpload: Dictionary | null = null;
    uploadedDictionaryPreview: Dictionary | null = null;
    waitingForConfirmation: boolean = false;
    waitingForDeleteConfirmation: boolean = false;
    waitingForResetConfirmation: boolean = false;
    waitingForModificationConfirmation: boolean = false;

    constructor(private commService: CommunicationService) {}

    init(): void {
        this.dictionaryErrors = {
            invalidFileType: false,
            invalidTitle: false,
            invalidDictionaryStructure: false,
            invalidJson: false,
        };
        this.getDictHeaders();
    }

    resetDictionaryErrors(): void {
        this.dictionaryErrors = {
            invalidFileType: false,
            invalidTitle: false,
            invalidDictionaryStructure: false,
            invalidJson: false,
        };
    }

    downloadDictionary(dictionaryTitle: string): void {
        this.waitingForConfirmation = true;
        this.commService.getDictionary(dictionaryTitle).subscribe((dictionary) => {
            const blob = new Blob([JSON.stringify(dictionary)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${dictionaryTitle}.json`);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            this.waitingForConfirmation = false;
        });
    }

    async handleDictInput(files: FileList | null): Promise<void> {
        this.waitingForConfirmation = true;
        if (!files) {
            this.waitingForConfirmation = false;
            return;
        }
        const file = files[0];
        if (!file) {
            this.waitingForConfirmation = false;
            return;
        }
        this.resetDictionaryErrors();
        if (file.type !== 'application/json') {
            this.dictionaryErrors.invalidFileType = true;
            this.waitingForConfirmation = false;
            return;
        }

        const dictionary = await this.parseDictionary(file);
        if (!dictionary) {
            this.waitingForConfirmation = false;
            return;
        }
        if (!this.isInstanceOfDictionary(dictionary)) {
            this.dictionaryErrors.invalidDictionaryStructure = true;
            this.waitingForConfirmation = false;
            return;
        }
        if (this.dictHeaders.some((dict) => dict.title === dictionary.title)) {
            this.dictionaryErrors.invalidTitle = true;
            this.waitingForConfirmation = false;
            return;
        }
        this.dictionaryToUpload = dictionary;
        this.handleDictionaryUpload();
    }

    deleteDictionary(name: string): void {
        this.waitingForDeleteConfirmation = true;
        this.commService.deleteDictionary(name).subscribe(() => {
            this.waitingForDeleteConfirmation = false;
        });
    }

    modifyDictionary(oldName: string, newName: string, description: string) {
        this.waitingForModificationConfirmation = true;
        this.commService.modifyDictionary(oldName, newName, description).subscribe(() => {
            this.waitingForModificationConfirmation = false;
        });
    }

    resetSettings(settingType: string): void {
        this.waitingForResetConfirmation = true;
        this.commService.resetSettings(settingType).subscribe(() => {
            this.waitingForResetConfirmation = false;
        });
    }

    async getVirtualPlayerName(mode: string): Promise<string> {
        return await this.commService.getVirtualPlayerName(mode as VirtualPlayerType).toPromise();
    }

    async getVirtualPlayerNames(): Promise<VirtualPlayerName[]> {
        return this.commService.getVirtualPlayerNames().toPromise();
    }

    addNewVirtualPlayer(name: string, virtualPlayerType: string): void {
        this.commService.addNewVirtualPlayer(name, virtualPlayerType as VirtualPlayerType).subscribe();
    }

    deleteVirtualPlayer(name: string, type: string): void {
        this.commService.deleteVirtualPlayer(name, type).subscribe();
    }

    renameVirtualPlayer(oldName: string, newName: string, type: string): void {
        this.commService.renameVirtualPlayer(oldName, newName, type as VirtualPlayerType).subscribe();
    }
    getDictHeaders(): void {
        this.commService.getDictionariesHeaders().subscribe((dictionariesTitles) => {
            if (!dictionariesTitles.length) {
                this.dictHeaders = [];
                return;
            }
            this.dictHeaders = dictionariesTitles;
        });
    }

    private handleDictionaryUpload(): void {
        if (!this.dictionaryToUpload) return;
        this.commService.uploadDictionary(this.dictionaryToUpload).subscribe((uploadedDictionary) => {
            if (!uploadedDictionary) {
                this.dictionaryErrors.invalidTitle = true;
                return;
            }
            const words = uploadedDictionary.words.slice(0, 3).concat([`... ${uploadedDictionary.words.length - 3} more items`]);
            this.uploadedDictionaryPreview = { ...uploadedDictionary, words };
            const uploadedDict: DictHeaders = { title: uploadedDictionary.title, description: uploadedDictionary.description };
            this.dictHeaders.push(uploadedDict);
            this.dictionaryToUpload = null;
            this.waitingForConfirmation = false;
        });
    }

    private async parseDictionary(file: File): Promise<Dictionary | null> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (!reader.result) reject(null);
                const result = reader.result as string;
                try {
                    const dictionary = JSON.parse(result);
                    resolve(dictionary);
                } catch (error) {
                    this.dictionaryErrors.invalidJson = true;
                    resolve(null);
                }
            };
            reader.readAsText(file);
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- We want to check any object if its of type Dictionary
    private isInstanceOfDictionary(object: any): object is Dictionary {
        const objectKeys = Object.keys(object);
        const dictionary: Dictionary = { description: '', title: '', words: [] };
        const dictionaryKeys = Object.keys(dictionary);
        if (objectKeys.length !== dictionaryKeys.length) return false;
        for (const key of objectKeys) {
            if (!dictionaryKeys.includes(key)) return false;
        }
        return true;
    }
}
