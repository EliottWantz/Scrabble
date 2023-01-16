import { Injectable } from '@angular/core';
import { CommandService } from '@app/services/command/command.service';
import { GameService } from '@app/services/game/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { WebsocketService } from '@app/services/socket/websocket.service';
import { StorageService } from '@app/services/storage/storage.service';
import { TimerService } from '@app/services/timer/timer.service';
import { ChatMessage } from '@common/chatMessage';
import { PlayableWord } from '@common/clue';
import { ClueCommand, Command, CommandError, CommandName, ExchangeCommand, PlaceCommand } from '@common/command';
import { ALPHABET } from '@common/grid/letterCount';
import { INDEX_ROW } from '@common/grid/row-index';
import { Player } from '@common/player';
import { BehaviorSubject } from 'rxjs';

export const PLACE_LETTERS_TIMEOUT = 3000;

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    player: Player;
    messages$: BehaviorSubject<ChatMessage[]>;

    constructor(
        public wsService: WebsocketService,
        private playerService: PlayerService,
        private timerService: TimerService,
        private gameService: GameService,
        private commandService: CommandService,
    ) {}

    init(): void {
        this.messages$ = new BehaviorSubject<ChatMessage[]>([]);
        this.messages$.next(StorageService.getMessages());
        this.messages$.subscribe((messages) => StorageService.setMessages(messages));
        this.playerService.player$.subscribe((player) => (this.player = player));
        this.timerService.timer$.subscribe((timer) => {
            if (!timer && this.player.isPlaying) this.sendMessage('!passer');
        });
        this.wsService.socket.on('message', (message) => this.addNewMessage(message));
        this.handleCommandSuccess();
        this.handleCommandShadowPlace();
        this.handleBadPositionCommand();
    }

    async send(inputValue: string) {
        if (!inputValue.startsWith('!')) {
            this.sendMessage(inputValue);
        } else {
            const error = await this.commandService.throwsError(inputValue);
            if (!error) {
                const parsedCommand = this.commandService.parseCommand(inputValue) as Command;
                this.sendCommand(parsedCommand);
            } else this.showError(error);
        }
    }

    addSystemMessage(data: string) {
        const message: ChatMessage = {
            data,
            from: 'system',
        };
        this.addNewMessage(message);
    }

    sendCommand(command: Command): void {
        if (!this.player.isPlaying && command.name !== CommandName.Reserve && command.name !== CommandName.Help)
            return this.showError(CommandError.Impossible);
        if (command.name === CommandName.Place) return this.handlePlaceCommand(command as PlaceCommand);
        if (command.name === CommandName.Reserve || command.name === CommandName.Help) {
            this.sendLocalMessage(command.fullCommand);
            if (command.name === CommandName.Reserve) {
                return this.handleReserveCommand();
            } else {
                return this.handleHelpCommand();
            }
        }
        this.wsService.sendCommand(command);
    }

    getErrorMessage(commandError: CommandError): string {
        switch (commandError) {
            case CommandError.Impossible:
                return 'Vous avez entré une commande impossible a réaliser';
            case CommandError.Invalid:
                return 'Vous avez entré une commande invalide';
            case CommandError.Syntax:
                return 'Vous avez mal spécifié les paramètres';
            case CommandError.GameDone:
                return 'Le jeux est terminer';
        }
    }
    showError(commandError: CommandError): void {
        const message = this.getErrorMessage(commandError);
        const errorMessage: ChatMessage = {
            from: 'system',
            data: message,
        };
        this.addNewMessage(errorMessage);
    }

    private handleBadPositionCommand(): void {
        this.wsService.socket.on('badPlaceCommandPosition', () => {
            this.addSystemMessage('Vous ne pouvez pas placer votre mot ici');
            this.wsService.requestGameUpdate();
        });
    }

    private handleCommandShadowPlace(): void {
        this.wsService.socket.on('shadowPlaceLetters', (command) => {
            this.sendMessage(command.fullCommand);
            const bufferGame = this.gameService.game$.getValue();
            this.wsService.shadowPlaceLetters(command as PlaceCommand, bufferGame, this.player.id);
            setTimeout(() => {
                this.addSystemMessage('Un ou plusieurs nouveaux mots créés ne sont pas dans le dictionnaire');
                this.wsService.requestGameUpdate();
            }, PLACE_LETTERS_TIMEOUT);
        });
    }

    private sendMessage(data: string, opponentVersion?: string): void {
        const message: ChatMessage = {
            data,
            from: 'player',
            playerName: this.player.name,
        };
        this.addNewMessage(message);
        if (opponentVersion) data = opponentVersion;
        this.wsService.sendMessage(data);
    }

    private sendLocalMessage(data: string): void {
        const message: ChatMessage = {
            data,
            from: 'player',
            playerName: this.player.name,
        };
        this.addNewMessage(message);
    }
    private addReserveMessage(data: string) {
        const message: ChatMessage = {
            data,
            from: 'reserve',
        };
        this.addNewMessage(message);
    }
    private addHelpMessage(data: string) {
        const message: ChatMessage = {
            data,
            from: 'help',
        };
        this.addNewMessage(message);
    }

    private showPlayableWords(data: string, playableWords: PlayableWord[]): void {
        const message: ChatMessage = {
            data,
            from: 'player',
            playerName: this.player.name,
        };
        this.addNewMessage(message);
        if (playableWords.length === 0) {
            const clueCommandNotification = "Aucun indice n'a été trouvé!";
            this.addSystemMessage(clueCommandNotification);
        } else if (playableWords.length < 3) {
            const clueCommandNotification = `Seulement ${playableWords.length} ont été trouvés`;
            this.addSystemMessage(clueCommandNotification);
        }
        for (const playableWord of playableWords) {
            const clueMessage = `!placer ${INDEX_ROW.get(playableWord.position.row)}${playableWord.position.col}${playableWord.direction}
            ${playableWord.word} Score: ${playableWord.score}`;
            this.addSystemMessage(clueMessage);
        }
    }

    private addNewMessage(message: ChatMessage): void {
        const messages = this.messages$.getValue().concat(message);
        this.updateState(messages);
    }

    private handleReserveCommand(): void {
        let message = '';
        let i = 0;
        for (const letter of ALPHABET) {
            let letterCount = 0;
            while (this.gameService.game$.value.letterReserve[i] && this.gameService.game$.value.letterReserve[i] === letter) {
                letterCount++;
                i++;
            }
            message += letter.toUpperCase() + ': ' + letterCount;
            if (letter !== '*') message += '\n';
        }
        this.addReserveMessage(message);
    }

    private handleHelpCommand(): void {
        let message = 'Voici une liste des commandes disponibles:\n';
        message += '!placer: permet de placer un mot, ex: !placer h8h allo\n';
        message += "!échanger: permet d'échanger les lettres spécifiées\n";
        message += '!passer: permet de passer votre tour\n';
        message += '!réserve: permet de voir les lettres dans la réserve\n';
        message += '!indice: permet de recevoir un indice de placement';
        this.addHelpMessage(message);
    }

    private handlePlaceCommand(command: PlaceCommand): void {
        if ((command as PlaceCommand).wordsInDictionary) return this.wsService.sendCommand(command);
        const bufferGame = this.gameService.game$.getValue();
        this.wsService.shadowPlaceLetters(command, bufferGame, this.player.id);
        setTimeout(() => {
            this.wsService.requestGameUpdate();
        }, PLACE_LETTERS_TIMEOUT);
    }

    private handleCommandSuccess(): void {
        this.wsService.socket.on('commandSuccess', (success, command) => {
            if (!success) return this.showError(CommandError.Impossible);
            if (command.name === 'échanger')
                this.sendMessage(command.fullCommand, `!${command.name} ${(command as ExchangeCommand).letters.length} lettres`);
            else if (command.name === 'indice') this.showPlayableWords(command.fullCommand, (command as ClueCommand).playableWords);
            else this.sendMessage(command.fullCommand);
        });
    }

    private updateState(state: ChatMessage[]): void {
        this.messages$.next(state);
    }
}
