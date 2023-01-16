/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CommandService } from '@app/services/command/command.service';
import { GameService } from '@app/services/game/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { WebsocketService } from '@app/services/socket/websocket.service';
import { StorageService } from '@app/services/storage/storage.service';
import { TimerService } from '@app/services/timer/timer.service';
import { reserveMessage } from '@app/utils/mocks/chat';
import { placeCommand } from '@app/utils/mocks/command';
import { stubGame } from '@app/utils/mocks/game';
import { stubPlayer } from '@app/utils/mocks/player';
import { MockSocketTestHelper } from '@app/utils/mocks/socket-test-helper';
import { ChatMessage } from '@common/chatMessage';
import { PlayableWord, Position } from '@common/clue';
import { ClueCommand, Command, CommandError, ExchangeCommand, PlaceCommand } from '@common/command';
import { Direction } from '@common/grid/direction';
import { FAKE_RESERVE_TEST } from '@common/grid/letterCount';
import { BehaviorSubject, of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { ChatService, PLACE_LETTERS_TIMEOUT } from './chat.service';

describe('ChatService', () => {
    let service: ChatService;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let timerServiceSpy: jasmine.SpyObj<TimerService>;
    let wsServiceSpy: jasmine.SpyObj<WebsocketService>;
    let socketHelper: MockSocketTestHelper;
    let commandServiceSpy: jasmine.SpyObj<CommandService>;

    beforeEach(() => {
        socketHelper = new MockSocketTestHelper();
        wsServiceSpy = jasmine.createSpyObj('WebsocketService', ['sendMessage', 'sendCommand', 'shadowPlaceLetters', 'requestGameUpdate'], {
            socket: socketHelper as unknown as Socket,
        });
        commandServiceSpy = jasmine.createSpyObj('CommandService', ['init', 'throwsError', 'parseCommand']);

        wsServiceSpy.socket.id = '123456789';
        playerServiceSpy = jasmine.createSpyObj('PlayerService', [], {
            player$: of(stubPlayer),
        });
        spyOn(StorageService, 'getMessages').and.returnValue([]);

        gameServiceSpy = jasmine.createSpyObj('GameService', ['timer$'], {
            game$: new BehaviorSubject(stubGame),
        });
        timerServiceSpy = jasmine.createSpyObj('TimerService', [''], {
            timer$: new BehaviorSubject(stubGame.timer),
        });
        TestBed.configureTestingModule({
            providers: [
                { provide: WebsocketService, useValue: wsServiceSpy },
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
                { provide: TimerService, useValue: timerServiceSpy },
                { provide: CommandService, useValue: commandServiceSpy },
            ],
        });
        service = TestBed.inject(ChatService);
        service.init();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('init() should initialize the service', () => {
        service.init();
        expect(service.messages$).toBeTruthy();
        expect(service.messages$.value).toEqual([]);
        expect(service.player).toBeTruthy();
    });

    it('init() should register a listener that sends a skip command if the player is playing and no time is remaining', () => {
        const sendCommandSpy = spyOn<any>(service, 'sendMessage').and.callThrough();
        service.player.isPlaying = true;
        timerServiceSpy.timer$.next(0);
        expect(sendCommandSpy).toHaveBeenCalledWith('!passer');
    });

    it('init() should register the onMessage listener that calls addNewMessage', () => {
        service.init();
        expect(service.messages$).toBeTruthy();
        expect(service.messages$.value).toEqual([]);
        expect(service.player).toBeTruthy();
    });

    it('init() should register the onCommandSuccess listener that calls showError if command not valid', () => {
        const command: Command = {
            fullCommand: '!placerr h8 e',
            name: 'placerr',
        };
        const showErrorSpy = spyOn<any>(service, 'showError').and.callThrough();
        socketHelper.peerSideEmit('commandSuccess', false, command);
        expect(showErrorSpy).toHaveBeenCalled();
    });

    it('init() should register the onCommandSuccess listener that calls sendMessage', () => {
        const command: Command = {
            fullCommand: '!placer h8 e',
            name: 'placer',
        };
        const sendMessageSpy = spyOn<any>(service, 'sendMessage').and.callThrough();
        socketHelper.peerSideEmit('commandSuccess', true, command);
        expect(sendMessageSpy).toHaveBeenCalledWith(command.fullCommand);
    });

    it('onCommandSuccess listener should calls sendMessage with the opponent version if case of an exchange', () => {
        const command: Command = {
            fullCommand: '!échanger 3 lettres',
            name: 'échanger',
        };
        const exchangeCommand: ExchangeCommand = {
            ...command,
            letters: 'abc',
        };
        const sendMessageSpy = spyOn<any>(service, 'sendMessage').and.callThrough();
        socketHelper.peerSideEmit('commandSuccess', true, exchangeCommand);
        expect(sendMessageSpy).toHaveBeenCalledWith(command.fullCommand, `!${command.name} ${exchangeCommand.letters.length} lettres`);
    });

    it('onCommandSuccess listener should call showPlayableWords in case a clue command has succeeded', () => {
        const command: Command = {
            fullCommand: '!indice',
            name: 'indice',
        };
        const clueCommand: ClueCommand = {
            ...command,
            playableWords: [],
        };
        const showPlayableWordsSpy = spyOn<any>(service, 'showPlayableWords').and.callThrough();
        socketHelper.peerSideEmit('commandSuccess', true, clueCommand);
        expect(showPlayableWordsSpy).toHaveBeenCalledWith(command.fullCommand, clueCommand.playableWords);
    });

    it("send() should send the message if input doesn't start with ! ", () => {
        const sendMessageSpy = spyOn<any>(service, 'sendMessage');
        const stubInput = 'test';
        service.send(stubInput);
        expect(sendMessageSpy).toHaveBeenCalledWith(stubInput);
    });

    it('send() should send the command if input starts with ! and is valid', fakeAsync(() => {
        const sendCommandSpy = spyOn<any>(service, 'sendCommand');
        const stubInput = '!passer';
        const parsedCommand: Command = {
            fullCommand: stubInput,
            name: 'passer',
        };
        commandServiceSpy.throwsError.and.returnValue(Promise.resolve(undefined));
        commandServiceSpy.parseCommand.and.returnValue(parsedCommand);

        service.send(stubInput);
        tick();
        expect(commandServiceSpy.throwsError).toHaveBeenCalledWith(stubInput);
        expect(commandServiceSpy.parseCommand).toHaveBeenCalledWith(stubInput);
        expect(sendCommandSpy).toHaveBeenCalledWith(parsedCommand);
    }));
    it('send() should call showError if input starts with ! and command is invalid', fakeAsync(() => {
        const showErrorSpy = spyOn<any>(service, 'showError');
        const stubInput = '!test';
        commandServiceSpy.throwsError.and.returnValue(Promise.resolve(CommandError.Invalid));
        service.send(stubInput);
        tick();
        expect(commandServiceSpy.throwsError).toHaveBeenCalledWith(stubInput);
        expect(showErrorSpy).toHaveBeenCalledWith(CommandError.Invalid);
    }));

    it('#sendMessage() should display the message and send it to the server', () => {
        const expectedChatMessage: ChatMessage = {
            data: 'test message',
            from: 'player',
            playerName: stubPlayer.name,
        };
        const addNewMessageSpy = spyOn<any>(service, 'addNewMessage').and.callThrough();
        service['sendMessage']('test message');
        expect(addNewMessageSpy).toHaveBeenCalledWith(expectedChatMessage);
        expect(wsServiceSpy.sendMessage).toHaveBeenCalledWith('test message');
    });

    it('#sendLocalMessage() should display the message and not send it to the server', () => {
        const expectedChatMessage: ChatMessage = {
            data: 'test message',
            from: 'player',
            playerName: stubPlayer.name,
        };
        const addNewMessageSpy = spyOn<any>(service, 'addNewMessage').and.callThrough();
        service['sendLocalMessage']('test message');
        expect(addNewMessageSpy).toHaveBeenCalledWith(expectedChatMessage);
        expect(wsServiceSpy.sendMessage).not.toHaveBeenCalledWith('test message');
    });

    it('#sendMessage() should display the message and send it to the server with the opponent version if given', () => {
        const expectedChatMessage: ChatMessage = {
            data: 'player version',
            from: 'player',
            playerName: stubPlayer.name,
        };
        const addNewMessageSpy = spyOn<any>(service, 'addNewMessage').and.callThrough();
        service['sendMessage']('player version', 'opponent version');
        expect(addNewMessageSpy).toHaveBeenCalledWith(expectedChatMessage);
        expect(wsServiceSpy.sendMessage).toHaveBeenCalledWith('opponent version');
    });

    it('#sendSystemMessage() should display the message', () => {
        const expectedChatMessage: ChatMessage = {
            data: 'test message',
            from: 'system',
        };
        const addNewMessageSpy = spyOn<any>(service, 'addNewMessage').and.callThrough();
        service.addSystemMessage('test message');
        expect(addNewMessageSpy).toHaveBeenCalledWith(expectedChatMessage);
    });

    it('#sendRéserveMessage() should display the reserve', () => {
        const addReserveMessageSpy = spyOn<any>(service, 'addReserveMessage').and.callThrough();
        service['addReserveMessage']('a: 14 ');
        expect(addReserveMessageSpy).toHaveBeenCalledWith(reserveMessage);
    });

    it('sendCommand() should send an impossible error message if the player is not playing', () => {
        const command: Command = {
            fullCommand: '!placer h8 e',
            name: 'placer',
        };
        service.player.isPlaying = false;
        const showErrorSpy = spyOn<any>(service, 'showError').and.callThrough();
        service['sendCommand'](command);
        expect(showErrorSpy).toHaveBeenCalledWith('impossible');
        expect(wsServiceSpy.sendCommand).not.toHaveBeenCalled();
    });

    it('sendCommand() should send the command échanger to the server if player is playing', () => {
        const command: Command = {
            fullCommand: '!échanger ea',
            name: 'échanger',
        };
        service.player.isPlaying = true;
        service['sendCommand'](command);
        expect(wsServiceSpy.sendCommand).toHaveBeenCalledWith(command);
    });

    it('sendCommand() should send the command réserve even if the player is not playing', () => {
        service['gameService'].game$.value.letterReserve = FAKE_RESERVE_TEST;
        const command: Command = {
            fullCommand: '!réserve',
            name: 'réserve',
        };
        service.player.isPlaying = false;
        const sendLocalMessageSpy = spyOn<any>(service, 'sendLocalMessage').and.callThrough();
        const handleReserveCommandSpy = spyOn<any>(service, 'handleReserveCommand').and.callThrough();
        service['sendCommand'](command);
        expect(sendLocalMessageSpy).toHaveBeenCalledWith(command.fullCommand);
        expect(handleReserveCommandSpy).toHaveBeenCalled();
    });

    it('sendCommand() should send the command aide even if the player is not playing', () => {
        const command: Command = {
            fullCommand: '!aide',
            name: 'aide',
        };
        service.player.isPlaying = false;
        const sendLocalMessageSpy = spyOn<any>(service, 'sendLocalMessage').and.callThrough();
        const handleHelpCommandSpy = spyOn<any>(service, 'handleHelpCommand').and.callThrough();
        service['sendCommand'](command);
        expect(sendLocalMessageSpy).toHaveBeenCalledWith(command.fullCommand);
        expect(handleHelpCommandSpy).toHaveBeenCalled();
    });

    it('sendCommand() should send the command placer to the server if player is playing', () => {
        service.player.isPlaying = true;
        placeCommand.wordsInDictionary = true;
        service['sendCommand'](placeCommand);
        expect(wsServiceSpy.sendCommand).toHaveBeenCalledWith(placeCommand);
    });

    it('should catch the badPlaceCommandPosition event and tell the player that he cannot put a word there', () => {
        const spyAddSystemMessage = spyOn(service, 'addSystemMessage').and.callThrough();
        socketHelper.peerSideEmit('badPlaceCommandPosition');
        expect(spyAddSystemMessage).toHaveBeenCalledOnceWith('Vous ne pouvez pas placer votre mot ici');
    });

    it('sendCommand() should send the command shadowPlace to the server if player is playing', (done) => {
        service.player.isPlaying = true;
        placeCommand.wordsInDictionary = false;
        service['sendCommand'](placeCommand);
        expect(wsServiceSpy.shadowPlaceLetters).toHaveBeenCalledWith(placeCommand, service['gameService'].game$.value, service.player.id);
        setTimeout(() => {
            wsServiceSpy.requestGameUpdate();
            expect(wsServiceSpy.requestGameUpdate).toHaveBeenCalled();
            done();
        }, PLACE_LETTERS_TIMEOUT);
    });

    it('getErrorMessage() should return the error message for type impossible', () => {
        const errorMessage = service['getErrorMessage'](CommandError.Impossible);
        expect(errorMessage).toEqual('Vous avez entré une commande impossible a réaliser');
    });

    it('getErrorMessage() should return the error message for type invalid', () => {
        const errorMessage = service['getErrorMessage'](CommandError.Invalid);
        expect(errorMessage).toEqual('Vous avez entré une commande invalide');
    });

    it('getErrorMessage() should return the error message for type syntax', () => {
        const errorMessage = service['getErrorMessage'](CommandError.Syntax);
        expect(errorMessage).toEqual('Vous avez mal spécifié les paramètres');
    });
    it('getErrorMessage() should return the error message for type Game is Done', () => {
        const errorMessage = service['getErrorMessage'](CommandError.GameDone);
        expect(errorMessage).toEqual('Le jeux est terminer');
    });

    it('showError() should display an error message of type impossible', () => {
        const errorMessage: ChatMessage = {
            from: 'system',
            data: 'Vous avez entré une commande impossible a réaliser',
        };
        const getErrorMessageSpy = spyOn<any>(service, 'getErrorMessage').and.callThrough();
        const addNewMessageSpy = spyOn<any>(service, 'addNewMessage').and.callThrough();
        service['showError'](CommandError.Impossible);
        expect(getErrorMessageSpy).toHaveBeenCalledWith('impossible');
        expect(addNewMessageSpy).toHaveBeenCalledWith(errorMessage);
    });

    it('showPlayableWords() should display a notification message that 0 playable words were found', () => {
        const notification = "Aucun indice n'a été trouvé!";
        const message: ChatMessage = {
            data: '!placer h8v chien',
            from: 'player',
            playerName: 'test player',
        };
        const playableWords: PlayableWord[] = [];
        const addNewMessageSpy = spyOn<any>(service, 'addNewMessage').and.callThrough();
        const addSystemMessageSpy = spyOn<any>(service, 'addSystemMessage').and.callThrough();
        service['showPlayableWords']('!placer h8v chien', playableWords);
        expect(addNewMessageSpy).toHaveBeenCalledWith(message);
        expect(addSystemMessageSpy).toHaveBeenCalledWith(notification);
    });

    it('showPlayableWords() should display a notification message that only 2 playable words were found', () => {
        const notification = 'Seulement 2 ont été trouvés';
        const message: ChatMessage = {
            data: '!placer h8v chien',
            from: 'player',
            playerName: 'test player',
        };
        const position: Position = {
            row: 8,
            col: 8,
        };
        const playableWord1: PlayableWord = {
            word: 'hello',
            position,
            direction: Direction.Horizontal,
            score: 5,
        };
        const playableWord2: PlayableWord = {
            word: 'cat',
            position,
            direction: Direction.Horizontal,
            score: 5,
        };
        const playableWords: PlayableWord[] = [playableWord1, playableWord2];
        const addNewMessageSpy = spyOn<any>(service, 'addNewMessage').and.callThrough();
        const addSystemMessageSpy = spyOn<any>(service, 'addSystemMessage').and.callThrough();
        service['showPlayableWords']('!placer h8v chien', playableWords);
        expect(addNewMessageSpy).toHaveBeenCalledWith(message);
        expect(addSystemMessageSpy).toHaveBeenCalledWith(notification);
    });

    it('showPlayableWords() should display 3 system messages showing the place commands for the words found', () => {
        const message: ChatMessage = {
            data: '!placer h8v chien',
            from: 'player',
            playerName: 'test player',
        };
        const position: Position = {
            row: 8,
            col: 8,
        };
        const playableWord1: PlayableWord = {
            word: 'hello',
            position,
            direction: Direction.Horizontal,
            score: 5,
        };
        const playableWord2: PlayableWord = {
            word: 'cat',
            position,
            direction: Direction.Horizontal,
            score: 5,
        };
        const playableWord3: PlayableWord = {
            word: 'yo',
            position,
            direction: Direction.Horizontal,
            score: 5,
        };
        const playableWords: PlayableWord[] = [playableWord1, playableWord2, playableWord3];
        const addNewMessageSpy = spyOn<any>(service, 'addNewMessage').and.callThrough();
        const addSystemMessageSpy = spyOn<any>(service, 'addSystemMessage').and.callThrough();
        service['showPlayableWords']('!placer h8v chien', playableWords);
        expect(addNewMessageSpy).toHaveBeenCalledWith(message);
        expect(addSystemMessageSpy).toHaveBeenCalled();
        expect(addSystemMessageSpy).toHaveBeenCalled();
        expect(addSystemMessageSpy).toHaveBeenCalled();
    });

    it('#addNewMessage() should add a new message', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Need to spy private method
        const updateStateSpy = spyOn<any>(service, 'updateState').and.callThrough();
        const message: ChatMessage = {
            data: 'test',
            from: 'player',
        };
        service['addNewMessage'](message);
        expect(updateStateSpy).toHaveBeenCalledWith([message]);
    });

    it('#updateState() should overwrite the current state with the one given as parameter', () => {
        const newState: ChatMessage[] = [{ data: 'test', from: 'opponent' }];
        // eslint-disable-next-line dot-notation -- updateState is private and we need access for the test
        service['updateState'](newState);
        expect(service.messages$.value).toEqual(newState);
    });

    it('Web socket onMessage event should call addNewMessage()', () => {
        const message: ChatMessage = {
            data: 'test',
            from: 'player',
        };
        const addNewMessageSpy = spyOn<any>(service, 'addNewMessage').and.callThrough();
        socketHelper.peerSideEmit('message', message);
        expect(addNewMessageSpy).toHaveBeenCalledWith(message);
    });

    it('handleShadowPlaceLetters should be called when the WebSocket receives a shadowPlaceLetters event', (done) => {
        const command: PlaceCommand = {
            fullCommand: '!placer h8h allo',
            name: 'placer',
            row: 'h',
            column: 8,
            direction: 'h',
            word: 'allo',
            wordsInDictionary: false,
        };
        const addSystemMessageSpy = spyOn(service, 'addSystemMessage').and.callThrough();
        socketHelper.peerSideEmit('shadowPlaceLetters', command);
        expect(wsServiceSpy.shadowPlaceLetters).toHaveBeenCalled();
        setTimeout(() => {
            expect(addSystemMessageSpy).toHaveBeenCalledWith('Un ou plusieurs nouveaux mots créés ne sont pas dans le dictionnaire');
            expect(wsServiceSpy.requestGameUpdate).toHaveBeenCalled();
            done();
        }, PLACE_LETTERS_TIMEOUT);
    });
});
