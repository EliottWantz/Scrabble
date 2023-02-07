import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { GameService } from '@app/services/game/game.service';
import { DEFAULT_PARAMETER, FORM_ERROR_MESSAGE, STEPPER_PAGE_IDX } from '@app/utils/constants/parameters-constants';
import { DictHeaders } from '@common/dictionary';
import { Game, gameModeData, GameOptions } from '@common/game';
import { Player, PlayerInfo } from '@common/player';
import { VirtualPlayerType } from '@common/virtualPlayer';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-parameters',
    templateUrl: './parameters.component.html',
    styleUrls: ['./parameters.component.scss'],
})
export class ParametersComponent implements OnInit {
    @ViewChild('stepper') stepper: MatStepper;

    createMultiplayer: boolean;
    gameMode: string;
    soloMode: boolean;
    maxValue: boolean;
    minValue: boolean;
    type: string;
    time: number;
    formPageButtonActive: boolean;
    name: FormControl;
    games$: Observable<Game[]>;
    dict: string;
    waiting: boolean;
    opponent: PlayerInfo;
    reject: boolean;
    virtualPlayerType: string;
    virtualPlayerName: string;
    currDict: DictHeaders;
    emptyDict: boolean;
    nonExistingDict: boolean;

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: gameModeData,
        private matDialog: MatDialog,
        public gameService: GameService,
        public dictionnaryService: DictionaryService,
    ) {
        this.dictionnaryService.init();

        this.name = new FormControl('', [Validators.required, Validators.minLength(3)]);
        this.createMultiplayer = true;
        this.gameMode = data.gameMode;
        this.minValue = false;
        this.maxValue = false;
        this.waiting = true;
        this.dict = '';
        this.gameService.init();
        this.games$ = this.gameService.joinableGames$;
        this.virtualPlayerType = VirtualPlayerType.debutant;
        this.virtualPlayerName = '';
        this.currDict = { title: '', description: '' };
        this.emptyDict = false;
        this.nonExistingDict = false;
    }
    ngOnInit(): void {
        this.time = DEFAULT_PARAMETER.initialTime;
    }

    closeModal(): void {
        this.matDialog.closeAll();
        this.name.setValue('');
        if (!this.gameService.wsService.socketAlive()) return;
        if (this.gameService.game$.value.id) {
            if (this.gameService.playerId === this.gameService.game$.value.creator.id) this.gameService.wsService.deleteGame();
            else this.gameService.wsService.removeOpponent();
        } else this.gameService.wsService.disconnect();
    }

    goBack(): void {
        if (this.stepper.selectedIndex > STEPPER_PAGE_IDX.gameModePage) {
            switch (this.stepper.selectedIndex) {
                case STEPPER_PAGE_IDX.configurationPage:
                    this.stepper.selectedIndex = STEPPER_PAGE_IDX.gameModePage;
                    break;
                case STEPPER_PAGE_IDX.gameListPage:
                    {
                        this.stepper.selectedIndex = STEPPER_PAGE_IDX.configurationPage;
                        this.formPageButtonActive = true;
                    }
                    break;
                case STEPPER_PAGE_IDX.waitingPage:
                    {
                        this.stepper.selectedIndex = STEPPER_PAGE_IDX.configurationPage;
                        this.formPageButtonActive = true;
                    }
                    break;
                case STEPPER_PAGE_IDX.confirmationPage:
                    this.stepper.selectedIndex = STEPPER_PAGE_IDX.gameListPage;
                    break;
                case STEPPER_PAGE_IDX.rejectedPage:
                    {
                        this.reject = false;
                        this.stepper.selectedIndex = STEPPER_PAGE_IDX.gameListPage;
                    }

                    break;
                case STEPPER_PAGE_IDX.nonExistingDict:
                    {
                        if (this.gameService.playerId === this.gameService.game$.value.creator.id) {
                            this.gameService.wsService.deleteGame();
                            this.dictionnaryService.getDictHeaders();
                            this.stepper.selectedIndex = STEPPER_PAGE_IDX.configurationPage;
                            this.nonExistingDict = false;
                        }
                    }
                    break;
            }
        }
    }

    async goToPageForm(page: string, mode: string = 'Multi'): Promise<void> {
        if (page === 'create') {
            this.createMultiplayer = true;
            if (mode === 'solo') {
                this.soloMode = true;
                this.virtualPlayerName = await this.dictionnaryService.getVirtualPlayerName(this.virtualPlayerType);
            } else this.soloMode = false;
        } else if (page === 'join') {
            this.createMultiplayer = false;
        } else {
            return;
        }
        this.stepper.next();
        this.formPageButtonActive = true;
        this.name.markAsUntouched();
    }

    decrementTime(): void {
        if (this.time > DEFAULT_PARAMETER.minimumTime) {
            this.time -= DEFAULT_PARAMETER.timeIncrement;
            this.maxValue = false;
        } else {
            this.minValue = true;
        }
    }
    incrementTime(): void {
        if (this.time < DEFAULT_PARAMETER.maximumTime) {
            this.time += DEFAULT_PARAMETER.timeIncrement;
            this.minValue = false;
        } else {
            this.maxValue = true;
        }
    }
    getErrorMessage(): string | void {
        if (this.name.hasError('required')) {
            return FORM_ERROR_MESSAGE.emptyName;
        }
        if (this.name.hasError('minlength')) {
            return FORM_ERROR_MESSAGE.minLenght;
        }
    }

    async createGame(): Promise<void> {
        if (this.name.errors) return;

        this.emptyDict = false;
        if (this.currDict.title === '') {
            this.emptyDict = true;
            return;
        }

        this.stepper.selectedIndex = STEPPER_PAGE_IDX.waitingPage;
        this.formPageButtonActive = false;
        this.name.markAllAsTouched();

        const gameOptions: Omit<GameOptions, 'playerId'> = {
            playerName: this.name.value,
            time: this.time,
            isMultiplayer: true,
            dictionary: this.currDict.title,
            gameMode: this.data.gameMode,
        };
        await this.gameService.createGame(gameOptions);
        this.handleOpponentLeftEvent();
        this.handleOpponentJoinedEvent();
    }

    async startSoloGame(): Promise<void> {
        if (this.name.errors) return;
        this.emptyDict = false;
        if (this.currDict.title === '') {
            this.emptyDict = true;
            return;
        }
        this.formPageButtonActive = false;
        this.name.markAllAsTouched();
        const gameOptions: Omit<GameOptions, 'playerId'> = {
            playerName: this.name.value,
            time: this.time,
            isMultiplayer: false,
            dictionary: this.currDict.title,
            opponentName: this.virtualPlayerName,
            gameMode: this.data.gameMode,
        };
        await this.gameService.createSoloGame(gameOptions, this.virtualPlayerType);
        this.handleDictionnaryDeleted();
    }

    listOfGame(): void {
        if (!this.name.errors) {
            this.stepper.selectedIndex = STEPPER_PAGE_IDX.gameListPage;
            this.formPageButtonActive = false;
        } else {
            this.name.markAllAsTouched();
            return;
        }
        this.gameService.viewGames(this.name.value);
    }
    joinGame(gameId: string): void {
        this.stepper.selectedIndex = STEPPER_PAGE_IDX.confirmationPage;
        this.handleRejectEvent(gameId);
        this.handleCreatorLeftEvent();
        this.gameService.joinGame(gameId, this.name.value);
        this.handleDictionnaryDeleted();
    }

    startGame(): void {
        this.gameService.startGame();
        this.handleDictionnaryDeleted();
    }

    rejectPlayer(): void {
        this.gameService.rejectPlayer();
        this.waiting = true;
    }
    async getRightVirtualPlayerName(value: string): Promise<void> {
        this.virtualPlayerName = await this.dictionnaryService.getVirtualPlayerName(
            value === VirtualPlayerType.debutant ? VirtualPlayerType.debutant : VirtualPlayerType.expert,
        );
    }

    async validateVirtualPlayerName(): Promise<void> {
        while (this.virtualPlayerName === this.name.value) {
            this.virtualPlayerName = await this.dictionnaryService.getVirtualPlayerName(this.virtualPlayerType);
        }
    }

    async convert(): Promise<void> {
        this.virtualPlayerName = await this.dictionnaryService.getVirtualPlayerName(this.virtualPlayerType);
        this.validateVirtualPlayerName();
        this.gameService.convertToSolo(this.virtualPlayerName, this.virtualPlayerType);
    }

    randomPlacement(games: Game[]): void {
        const gamesDeepCopy: Game[] = JSON.parse(JSON.stringify(games));
        while (gamesDeepCopy.length > 0) {
            const randomIndex = Math.floor(Math.random() * gamesDeepCopy.length);
            if (this.name.value === (gamesDeepCopy[randomIndex].creator as Player).name) {
                gamesDeepCopy.splice(randomIndex, 1);
            } else {
                this.joinGame(gamesDeepCopy[randomIndex].id);
                break;
            }
        }
    }

    private handleDictionnaryDeleted(): void {
        // this.gameService.wsService.socket.on('nonExistingDict', () => {
            // this.nonExistingDict = true;
            // this.stepper.selectedIndex = STEPPER_PAGE_IDX.nonExistingDict;
        // });
    }

    private handleCreatorLeftEvent(): void {
        // this.gameService.wsService.socket.on('playerLeft', () => {
            // this.gameService.wsService.leaveRoom();
            // this.stepper.selectedIndex = STEPPER_PAGE_IDX.gameListPage;
            // this.nonExistingDict = false;
        // });
    }

    private handleOpponentLeftEvent(): void {
        // this.gameService.wsService.socket.on('playerLeft', () => {
            // this.waiting = true;
            // this.nonExistingDict = false;
        // });
    }

    private handleOpponentJoinedEvent(): void {
        // this.gameService.wsService.socket.on('playerJoined', (player) => {
            // this.waiting = false;
            // this.opponent = player;
        // });
    }

    private handleRejectEvent(gameId: string): void {
        // this.gameService.wsService.socket.on('rejected', (player) => {
            // this.reject = true;
            // this.opponent = player;
            // this.gameService.wsService.socket.emit('leaveRoom', gameId);
            // this.stepper.selectedIndex = STEPPER_PAGE_IDX.rejectedPage;
        // });
    }
}
