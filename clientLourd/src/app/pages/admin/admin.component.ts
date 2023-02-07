/* eslint-disable no-invalid-this */
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { GameService } from '@app/services/game/game.service';
import { SETTINGS_TYPE } from '@common/dictionnary';
import { VirtualPlayerName } from '@common/player';
@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
    @ViewChild(MatAccordion) accordion: MatAccordion;
    @ViewChild('dictForm') dictForm: ElementRef<HTMLFormElement>;
    newVirtualPlayerName: FormControl = new FormControl('', [Validators.required, this.nameValidation()]);
    virtualPlayerType: string = 'Debutant';
    dictionarySettings: string = 'modifier';
    newName: FormControl = new FormControl('', [Validators.required, this.titleValidation()]);
    newDescription: FormControl = new FormControl('', [Validators.required]);
    currentActive: string = '';
    virtualPlayerName: VirtualPlayerName[];
    currDict: string = '';
    settings: string = '';
    settingType: string[] = SETTINGS_TYPE;
    selectedDictName: string = 'Défaut';
    selectedDict: { title: string; description: string };
    titleExistAlready: boolean = false;
    modifyName: boolean = false;
    step = 0;
    constructor(public gameService: GameService, public dictionaryService: DictionaryService) {
        this.dictionaryService.init();
    }
    ngOnInit(): void {
        this.getVirtualPlayerName(this.virtualPlayerType).then(() => {
            this.currentActive = this.virtualPlayerName[0].name;
        });

        this.gameService.wsService.connect('Admin');
        this.handleVirtualPlayerChange();
        this.handleNewDict();
    }
    async getVirtualPlayerName(virtualPlayerType: string): Promise<void> {
        this.virtualPlayerType = virtualPlayerType;
        this.virtualPlayerName = (await this.dictionaryService.getVirtualPlayerNames()).filter((p) => p.type === virtualPlayerType);
    }

    renameVirtualPlayer(oldName: string, newName: string): void {
        this.dictionaryService.renameVirtualPlayer(oldName, newName, this.virtualPlayerType);
    }

    reset() {
        this.dictionaryService.resetSettings(this.settings);
    }
    addNewVirtualPlayer() {
        if (this.newVirtualPlayerName.errors?.newVirtualPlayerName) {
            this.newVirtualPlayerName.markAllAsTouched();
            return;
        }
        this.dictionaryService.addNewVirtualPlayer(this.newVirtualPlayerName.value, this.virtualPlayerType);
    }

    deleteVirtualPlayer(name: string) {
        this.dictionaryService.deleteVirtualPlayer(name, this.virtualPlayerType);
    }

    deleteDictionary(): void {
        this.dictionaryService.deleteDictionary(this.currDict);
    }

    modifyDictionary(): void {
        if (this.newName.errors?.newName) {
            this.newName.markAllAsTouched();
            return;
        }
        this.dictionaryService.modifyDictionary(this.currDict, this.newName.value, this.newDescription.value);
    }

    private handleVirtualPlayerChange(): void {
        // this.gameService.wsService.socket.on('virtualPlayerChange', (virtualPlayers: VirtualPlayerName[]) => {
            // this.virtualPlayerName = virtualPlayers.filter((p) => p.type === this.virtualPlayerType);
            // this.newVirtualPlayerName.setValue('');
            // this.newVirtualPlayerName.markAsUntouched();
        // });
    }

    private handleNewDict(): void {
        // this.gameService.wsService.socket.on('newDict', (dict) => {
            // this.dictionaryService.dictHeaders = dict;
            // this.newDescription.setValue('');
            // this.newName.setValue('');
        // });
    }

    private nameValidation(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (this.virtualPlayerName) {
                const existingVirtualPlayerValidator = this.virtualPlayerName.find((p) => p.name.toLowerCase() === control.value.toLowerCase());
                return typeof existingVirtualPlayerValidator === 'undefined' ? null : { newVirtualPlayerName: true };
            }
            return null;
        };
    }

    private titleValidation(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (this.dictionaryService.dictHeaders) {
                const existingTitleValidator = this.dictionaryService.dictHeaders.some((t) => {
                    return t.title.toLowerCase() === control.value.toLowerCase();
                });
                return { newName: existingTitleValidator };
            }
            return null;
        };
    }
}
