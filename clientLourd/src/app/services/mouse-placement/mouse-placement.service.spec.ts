/* eslint-disable dot-notation */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-helper/canvas-test-helper';
import { ChatService } from '@app/services/chat/chat.service';
import { CommandService } from '@app/services/command/command.service';
import { EaselService } from '@app/services/easel/easel.service';
import { GameService } from '@app/services/game/game.service';
import { GridService } from '@app/services/grid/grid.service';
import { PlayerService } from '@app/services/player/player.service';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/utils/constants/grid-constants';
import { STUB_GRID } from '@app/utils/constants/grid-service-test';
import { Vec2 } from '@app/utils/Interface/vec2';
import { stubGame } from '@app/utils/mocks/game';
import { stubLetter, stubPlayer2 } from '@app/utils/mocks/player';
import { Command, CommandError } from '@common/command';
import { Letter } from '@common/grid/node';
import { of } from 'rxjs';
import { BoardPos, MousePlacementService } from './mouse-placement.service';

describe('MousePlacementService', () => {
    let service: MousePlacementService;
    let easelServiceSpy: jasmine.SpyObj<EaselService>;
    let gridServiceSpy: jasmine.SpyObj<GridService>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let commandServiceSpy: jasmine.SpyObj<CommandService>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;

    let stubEasel: Letter[];

    beforeEach(() => {
        easelServiceSpy = jasmine.createSpyObj('EaselService', ['removeLetterAccent', 'hasLetters']);
        gridServiceSpy = jasmine.createSpyObj('GridService', ['init', 'drawGrid', 'renderRect', 'clearCanvas', 'drawHeader', 'drawLetters'], {
            grid: JSON.parse(JSON.stringify(STUB_GRID)),
            gridContext: CanvasTestHelper.createCanvas(DEFAULT_WIDTH, DEFAULT_HEIGHT).getContext('2d') as CanvasRenderingContext2D,
        });
        gameServiceSpy = jasmine.createSpyObj('GameService', [''], {
            game$: of(stubGame),
        });
        commandServiceSpy = jasmine.createSpyObj('CommandService', ['init', 'throwsError', 'parseCommand']);
        chatServiceSpy = jasmine.createSpyObj('ChatService', ['init', 'sendMessage', 'sendCommand', 'showError']);
        playerServiceSpy = jasmine.createSpyObj('PlayerService', [''], {
            player$: of(stubPlayer2),
        });
        TestBed.configureTestingModule({
            providers: [
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: EaselService, useValue: easelServiceSpy },
                { provide: GridService, useValue: gridServiceSpy },
                { provide: CommandService, useValue: commandServiceSpy },
                { provide: ChatService, useValue: chatServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
            ],
        });
        stubEasel = JSON.parse(JSON.stringify([stubLetter, { character: 'l', value: 2 }, stubLetter]));
        service = TestBed.inject(MousePlacementService);
        service.init();
        gridServiceSpy.init();
        chatServiceSpy.init();
        service.player.easel = stubEasel;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('init should initialize the correct player in playerService', () => {
        expect(service.player).toEqual(stubPlayer2);
    });

    it('setMarker should set the marker if the position is valid', () => {
        const pos: Vec2 = { x: 400, y: 400 };
        const markerExpected: BoardPos = service['getVecToBoardPos'](pos) as BoardPos;
        service.setMarker(pos);
        expect(service.marker).toEqual(markerExpected);
    });

    it('setMarker should set the new marker if there is already a marker', () => {
        const pos1: Vec2 = { x: 400, y: 400 };
        const pos2: Vec2 = { x: 500, y: 500 };
        const markerExpected: BoardPos = service['getVecToBoardPos'](pos2) as BoardPos;
        service.setMarker(pos1);
        service.setMarker(pos2);
        expect(service.marker).toEqual(markerExpected);
    });

    it('setMarker should call switchOrientation if we click in the same case', () => {
        const pos1: Vec2 = { x: 400, y: 400 };
        const pos2: Vec2 = { x: 400, y: 400 };
        const switchOrientationSpy = spyOn(service as any, 'switchOrientation').and.callThrough();
        service.setMarker(pos1);
        service.setMarker(pos2);
        expect(switchOrientationSpy).toHaveBeenCalled();
    });

    it('setMarker should return undefined if the position is invalid', () => {
        const pos: Vec2 = { x: 1900, y: 400 };
        service.setMarker(pos);
        expect(service.marker).toBeUndefined();
    });

    it('setMarker should set isMarkerVisible to true if the position is valid', () => {
        const pos: Vec2 = { x: 400, y: 400 };
        service.setMarker(pos);
        expect(service.isMarkerVisible).toBeTruthy();
    });

    it('setMarker should call renderRect if the position is valid', () => {
        const renderRectSpy = spyOn(service as any, 'renderRect').and.callThrough();
        const pos: Vec2 = { x: 400, y: 400 };
        service.setMarker(pos);
        expect(renderRectSpy).toHaveBeenCalled();
    });

    it('getNextIncrementedMarker should increment the row if the orientation is horizontal ', () => {
        const pos: Vec2 = { x: 400, y: 400 };
        const markerExpected: BoardPos = service['getVecToBoardPos'](pos) as BoardPos;
        service.setMarker(pos);
        service.orientation === 'h' ? markerExpected.col++ : markerExpected.row++;
        expect(service['getNextIncrementedMarker']()).toEqual(markerExpected);
    });

    it('getNextIncrementedMarker should increment the row if the orientation is horizontal ', () => {
        const pos: Vec2 = { x: 400, y: 400 };
        const markerExpected: BoardPos = service['getVecToBoardPos'](pos) as BoardPos;
        service.setMarker(pos);
        service.orientation = 'v';
        service.orientation === 'h' ? markerExpected.col++ : markerExpected.row++;
        expect(service['getNextIncrementedMarker']()).toEqual(markerExpected);
    });

    it('incrementMarkerPosition should increment the current marker row if the orientation is horizontal', () => {
        const pos: Vec2 = { x: 400, y: 400 };
        const markerExpected: BoardPos = service['getVecToBoardPos'](pos) as BoardPos;
        service.setMarker(pos);
        service['incrementMarkerPosition']();
        service.orientation === 'h' ? markerExpected.col++ : markerExpected.row++;
        expect(service.marker).toEqual(markerExpected);
    });
    it('incrementMarkerPosition should continue to increment the current marker while there is letters and if the orientation is horizontal', () => {
        const pos: Vec2 = { x: 400, y: 400 };
        const markerExpected: BoardPos = service['getVecToBoardPos'](pos) as BoardPos;
        gridServiceSpy.grid[markerExpected.row][markerExpected.col + 1].isEmpty = false;
        service.setMarker(pos);
        service['incrementMarkerPosition']();
        expect(service.marker).toEqual({ row: markerExpected.row, col: markerExpected.col + 2 });
    });

    it('incrementMarkerPosition should increment the current marker col if the orientation is vertical', () => {
        const pos: Vec2 = { x: 400, y: 400 };
        const markerExpected: BoardPos = service['getVecToBoardPos'](pos) as BoardPos;
        service.setMarker(pos);
        service.orientation = 'v';
        service['incrementMarkerPosition']();
        service.orientation === 'h' ? markerExpected.col++ : markerExpected.row++;
        expect(service.marker).toEqual(markerExpected);
    });

    it('incrementMarkerPosition should continue to increment the current marker while there is letters and if the orientation is vertical', () => {
        const pos: Vec2 = { x: 400, y: 400 };
        const markerExpected: BoardPos = service['getVecToBoardPos'](pos) as BoardPos;
        gridServiceSpy.grid[markerExpected.row + 1][markerExpected.col].isEmpty = false;
        service.setMarker(pos);
        service.orientation = 'v';
        service['incrementMarkerPosition']();
        expect(service.marker).toEqual({ row: markerExpected.row + 2, col: markerExpected.col });
    });

    it('decrementMarkerPosition should decrement the current marker depending on the current orientation', () => {
        const pos: Vec2 = { x: 400, y: 400 };
        const markerExpected: BoardPos = service['getVecToBoardPos'](pos) as BoardPos;
        service.setMarker(pos);
        service['decrementMarkerPosition']();
        service.orientation === 'h' ? markerExpected.col-- : markerExpected.row--;
        expect(service.marker).toEqual(markerExpected);
    });

    it('decrementMarkerPosition should continue to decrement the current marker while there is letters and if the orientation is horizontal', () => {
        const pos: Vec2 = { x: 400, y: 400 };
        const markerExpected: BoardPos = service['getVecToBoardPos'](pos) as BoardPos;
        gridServiceSpy.grid[markerExpected.row][markerExpected.col - 1].isEmpty = false;
        service.setMarker(pos);
        service['decrementMarkerPosition']();
        expect(service.marker).toEqual({ row: markerExpected.row, col: markerExpected.col - 2 });
    });

    it('decrementMarkerPosition should decrement the current marker col if the orientation is vertical', () => {
        const pos: Vec2 = { x: 400, y: 400 };
        const markerExpected: BoardPos = service['getVecToBoardPos'](pos) as BoardPos;
        service.setMarker(pos);
        service.orientation = 'v';
        service['decrementMarkerPosition']();
        service.orientation === 'h' ? markerExpected.col-- : markerExpected.row--;
        expect(service.marker).toEqual(markerExpected);
    });

    it('decrementMarkerPosition should continue to decrement the current marker while there is letters and if the orientation is vertical', () => {
        const pos: Vec2 = { x: 400, y: 400 };
        const markerExpected: BoardPos = service['getVecToBoardPos'](pos) as BoardPos;
        gridServiceSpy.grid[markerExpected.row - 1][markerExpected.col].isEmpty = false;
        service.setMarker(pos);
        service.orientation = 'v';
        service['decrementMarkerPosition']();
        expect(service.marker).toEqual({ row: markerExpected.row - 2, col: markerExpected.col });
    });

    it('addletter should call removeLetterAccent from easel service', () => {
        const letter = 'ç';
        service.addLetter(letter);
        expect(easelServiceSpy.removeLetterAccent).toHaveBeenCalledWith(letter);
    });

    it('addletter should call getNextIncrementedMarker if the marker is visible', () => {
        const pos: Vec2 = { x: 400, y: 400 };
        const getNextIncrementedMarkerSpy = spyOn(service as any, 'getNextIncrementedMarker').and.callThrough();
        easelServiceSpy.hasLetters.and.returnValue(true);
        service.setMarker(pos);
        const letter = stubLetter.character;
        easelServiceSpy.removeLetterAccent.and.returnValue(letter);
        service.addLetter(letter);
        expect(getNextIncrementedMarkerSpy).toHaveBeenCalled();
    });

    it('addletter should change the UpperCase flag if the letter is Uppercase', () => {
        const pos: Vec2 = { x: 400, y: 400 };
        easelServiceSpy.hasLetters.and.returnValue(true);
        service.setMarker(pos);
        const letter = 'L';
        easelServiceSpy.removeLetterAccent.and.returnValue(letter);
        service.addLetter(letter);
        expect(service.isUpperCase).toBeFalsy();
    });

    it('addletter should set isMarkerVisible to false if the next marker is out of bounds', () => {
        const pos: Vec2 = { x: 10000, y: 600 };
        easelServiceSpy.hasLetters.and.returnValue(true);
        service.setMarker(pos);
        const letter = 'L';
        easelServiceSpy.removeLetterAccent.and.returnValue(letter);
        service.addLetter(letter);
        expect(service.isMarkerVisible).toBeFalsy();
    });

    it('cancelPreviousPlacement should call addLetterToRack with lowercase letter if its lowercase ', () => {
        const pos: Vec2 = { x: 400, y: 400 };
        service.setMarker(pos);
        const stubLetterPos = { letter: stubLetter, row: 2, col: 2 };
        const addLetterToRackSpy = spyOn(service as any, 'addLetterToRack').and.callThrough();
        service.letterPositions.push(stubLetterPos);
        service.cancelPreviousPlacement();
        expect(addLetterToRackSpy).toHaveBeenCalledWith(service.player.easel, stubLetterPos.letter.character);
    });
    it('cancelPreviousPlacement should call addLetterToRack with * if its Uppercase ', () => {
        const pos: Vec2 = { x: 400, y: 400 };
        service.setMarker(pos);
        const stubLetterPos = { letter: { character: 'L', value: 2 }, row: 2, col: 2 };
        const addLetterToRackSpy = spyOn(service as any, 'addLetterToRack').and.callThrough();
        service.letterPositions.push(stubLetterPos);
        service.cancelPreviousPlacement();
        expect(addLetterToRackSpy).toHaveBeenCalledWith(service.player.easel, '*');
    });

    it('cancelPreviousPlacement should return undefined if theres is no letter placed', () => {
        const pos: Vec2 = { x: 400, y: 400 };
        service.setMarker(pos);
        const result = service.cancelPreviousPlacement();
        expect(result).toBeUndefined();
    });

    it('cancelPreviousPlacement should set isMarkerVisible to true if theres is a letter in last row or column', () => {
        const pos: Vec2 = { x: 400, y: 400 };
        service.setMarker(pos);
        const stubLetterPos = { letter: stubLetter, row: 2, col: 2 };
        service.letterPositions.push(stubLetterPos);
        service.isMarkerVisible = false;
        service.cancelPreviousPlacement();
        expect(service.isMarkerVisible).toBeTruthy();
    });

    it('cancelPreviousPlacement should call decrementMarkerPosition if marker is visible', () => {
        const pos: Vec2 = { x: 400, y: 400 };
        service.setMarker(pos);
        const stubLetterPos = { letter: stubLetter, row: 2, col: 2 };
        const decrementMarkerPositionSpy = spyOn(service as any, 'decrementMarkerPosition');
        service.letterPositions.push(stubLetterPos);
        service.cancelPreviousPlacement();
        expect(decrementMarkerPositionSpy).toHaveBeenCalled();
    });

    it('cancelPreviousPlacement should call renderRect if marker is visible', () => {
        const pos: Vec2 = { x: 400, y: 400 };
        service.setMarker(pos);
        const stubLetterPos = { letter: stubLetter, row: 2, col: 2 };
        const renderRectSpy = spyOn(service as any, 'renderRect');
        service.letterPositions = [stubLetterPos];
        service.cancelPreviousPlacement();
        expect(renderRectSpy).toHaveBeenCalled();
    });

    it('confirmPlacement should return undefined if theres no letter placed ', async () => {
        const pos: Vec2 = { x: 400, y: 400 };
        service.setMarker(pos);
        const result = await service.confirmPlacement();
        expect(result).toBeUndefined();
    });

    it('confirmPlacement should call getPlacementCommand', async () => {
        const pos: Vec2 = { x: 400, y: 400 };
        service.setMarker(pos);
        const stubLetterPos = { letter: stubLetter, row: 2, col: 2 };
        service.letterPositions = [stubLetterPos];
        const getPlacementCommandSpy = spyOn(service as any, 'getPlacementCommand');
        await service.confirmPlacement();
        expect(getPlacementCommandSpy).toHaveBeenCalled();
    });

    it('confirmPlacement should call getPlacementCommand', async () => {
        const pos: Vec2 = { x: 400, y: 400 };
        service.setMarker(pos);
        const stubLetterPos = { letter: stubLetter, row: 2, col: 2 };
        service.letterPositions = [stubLetterPos];
        const getPlacementCommandSpy = spyOn(service as any, 'getPlacementCommand');
        await service.confirmPlacement();
        expect(getPlacementCommandSpy).toHaveBeenCalled();
    });

    it('confirmPlacement should send the command if input starts with ! and is valid', async () => {
        const pos: Vec2 = { x: 400, y: 400 };
        service.setMarker(pos);
        const stubLetterPos = { letter: stubLetter, row: 3, col: 3 };
        service.letterPositions = [stubLetterPos];
        const stubInput = service['getPlacementCommand']();
        const parsedCommand: Command = {
            fullCommand: stubInput,
            name: 'placer',
        };
        commandServiceSpy.throwsError.and.returnValue(Promise.resolve(undefined));
        commandServiceSpy.parseCommand.and.returnValue(parsedCommand);
        await service.confirmPlacement();

        expect(commandServiceSpy.throwsError).toHaveBeenCalled();
        expect(commandServiceSpy.parseCommand).toHaveBeenCalled();
    });

    it('confirmPlacement should call showError if input starts with ! and command is invalid', async () => {
        const pos: Vec2 = { x: 400, y: 400 };
        service.setMarker(pos);
        const stubLetterPos = { letter: stubLetter, row: 2, col: 2 };
        service.letterPositions.push(stubLetterPos);
        commandServiceSpy.throwsError.and.returnValue(Promise.resolve(CommandError.Invalid));
        await service.confirmPlacement();
        expect(chatServiceSpy.showError).toHaveBeenCalled();
    });

    it('cancelPlacement should reset the marker and the orientation', () => {
        const pos: Vec2 = { x: 400, y: 400 };
        service.setMarker(pos);
        service.cancelPlacement();
        expect(service.isMarkerVisible).toBeFalsy();
        expect(service.orientation).toEqual('h');
    });

    it('cancelPlacement should call removeLettersPlaced', () => {
        const pos: Vec2 = { x: 400, y: 400 };
        service.setMarker(pos);
        const removeLettersPlacedSpy = spyOn(service as any, 'removeLettersPlaced').and.callThrough();
        service.cancelPlacement();
        expect(removeLettersPlacedSpy).toHaveBeenCalled();
    });

    it('getPlacementCommand should call getCommandParams', () => {
        const pos: Vec2 = { x: 400, y: 400 };
        service.setMarker(pos);
        const stubLetterPos = { row: 3, col: 3 };
        service.letterPositions.push(stubLetterPos);
        const getCommandParamsSpy = spyOn(service as any, 'getCommandParams').and.callThrough();
        service['getPlacementCommand']();
        expect(getCommandParamsSpy).toHaveBeenCalled();
    });

    it('getPlacementCommand should call getCommandLetters', () => {
        const pos: Vec2 = { x: 400, y: 400 };
        service.setMarker(pos);
        const stubLetterPos = { row: 3, col: 3 };
        service.letterPositions.push(stubLetterPos);
        const getCommandLettersSpy = spyOn(service as any, 'getCommandLetters').and.callThrough();
        service['getPlacementCommand']();
        expect(getCommandLettersSpy).toHaveBeenCalled();
    });

    it('getCommandParams should call getRowToChar', () => {
        const pos: Vec2 = { x: 400, y: 400 };
        service.setMarker(pos);
        const stubLetterPos = { row: 3, col: 3 };
        service.letterPositions.push(stubLetterPos);
        const getRowToCharSpy = spyOn(service as any, 'getRowToChar').and.callThrough();
        service['getPlacementCommand']();
        expect(getRowToCharSpy).toHaveBeenCalled();
    });

    it('getCommandLetters should return all letters in letterPositions', () => {
        const stubLetterPos = { row: 3, col: 3, letter: stubLetter };
        service.letterPositions.push(stubLetterPos);
        const result = service['getCommandLetters']();
        expect(result).toEqual(stubLetterPos.letter.character);
    });

    it('switchOrientation should change the orientation to vertical if its horizontal', () => {
        service['switchOrientation']();
        expect(service.orientation).toEqual('v');
    });

    it('switchOrientation should change the orientation to horizontal if its vertical', () => {
        service.orientation = 'v';
        service['switchOrientation']();
        expect(service.orientation).toEqual('h');
    });

    it('getOrientation should return the symbol horizontal if the orientation is horizontal', () => {
        const result = service['getOrientation']();
        expect(result).toEqual('►');
    });

    it('getOrientation should return the symbol vertical if the orientation is vertical', () => {
        service.orientation = 'v';
        const result = service['getOrientation']();
        expect(result).toEqual('▼');
    });

    it('getRowToChar should return the correct row in string', () => {
        const row = 0;
        const expectedRow = 'a';
        expect(service['getRowToChar'](row)).toEqual(expectedRow);
    });

    it('isTileEmpty should return if the grid position is empty', () => {
        const stubLetterPos = { row: 3, col: 3 };
        const result = service['isTileEmpty'](stubLetterPos);
        expect(result).toBeTruthy();
    });

    it('isMarkerValid should return if the marker position is valid', () => {
        const stubLetterPos = { row: 3, col: 3 };
        const result = service['isMarkerValid'](stubLetterPos);
        expect(result).toBeTruthy();
    });

    it('isPosValid should return if the mouse cursor position is valid', () => {
        const pos: Vec2 = { x: 400, y: 400 };
        const result = service['isPosValid'](pos.x);
        expect(result).toBeTruthy();
    });

    it('getVecToBoardPos should return undefined if the posistion is invalid', () => {
        const pos: Vec2 = { x: 1900, y: 400 };
        const result = service['getVecToBoardPos'](pos);
        expect(result).toBeUndefined();
    });
});
