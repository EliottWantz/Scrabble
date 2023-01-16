/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-helper/canvas-test-helper';
import { GameService } from '@app/services/game/game.service';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/utils/constants/grid-constants';
import { STUB_GRID } from '@app/utils/constants/grid-service-test';
import { Vec2 } from '@app/utils/Interface/vec2';
import { stubGame } from '@app/utils/mocks/game';
import { of } from 'rxjs';
import { GridService } from './grid.service';

describe('GridService', () => {
    let httpMock: HttpTestingController;
    let service: GridService;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let ctxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        gameServiceSpy = jasmine.createSpyObj('GameService', [''], {
            game$: of(stubGame),
        });
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: GameService, useValue: gameServiceSpy }],
        });
        service = TestBed.inject(GridService);
        ctxStub = CanvasTestHelper.createCanvas(DEFAULT_WIDTH, DEFAULT_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        service.gridContext = ctxStub;
        service.grid = JSON.parse(JSON.stringify(STUB_GRID));
        httpMock = TestBed.inject(HttpTestingController);
        gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('init should initialize the grid', () => {
        service.init();
        expect(service.grid$).toBeDefined();
        service.grid$.subscribe((grid) => expect(grid).toEqual(stubGame.grid));
    });

    it('width should return the width of the grid canvas', () => {
        expect(service.width).toEqual(DEFAULT_WIDTH);
    });

    it('height should return the height of the grid canvas', () => {
        expect(service.width).toEqual(DEFAULT_HEIGHT);
    });

    it('clearCanvas should call drawGrid and renderRect', () => {
        const drawGridSpy = spyOn<any>(service, 'drawGrid').and.callThrough();
        const renderRectSpy = spyOn<any>(service, 'renderRect').and.callThrough();
        service.clearCanvas(service.gridContext);
        expect(drawGridSpy).toHaveBeenCalled();
        expect(renderRectSpy).toHaveBeenCalled();
    });

    it('getRowToChar should return the correct row in string', () => {
        const row = 0;
        const expectedRow = 'A';
        expect(service['getRowToChar'](row)).toEqual(expectedRow);
    });

    it('drawWord should call drawSpecialCase if the array contains 2 words', () => {
        const wordPos: Vec2 = { x: 39, y: 39 };
        const drawSpecialSpy = spyOn<any>(service, 'drawSpecialCase').and.callThrough();
        const word = ['MOT', 'X3'];
        service['drawWord'](word, wordPos);
        expect(drawSpecialSpy).toHaveBeenCalled();
    });

    it('drawWord should call drawLetters if the array contains letters with its score', () => {
        const wordPos: Vec2 = { x: 78, y: 78 };
        const drawSpecialSpy = spyOn<any>(service, 'drawLetters').and.callThrough();
        const word = ['A1'];
        service['drawWord'](word, wordPos);
        expect(drawSpecialSpy).toHaveBeenCalled();
    });

    it('drawWord should call drawHeader if the array length is 1', () => {
        const wordPos: Vec2 = { x: 39, y: 0 };
        const drawSpecialSpy = spyOn<any>(service, 'drawHeader').and.callThrough();
        const word = ['1'];
        service['drawWord'](word, wordPos);
        expect(drawSpecialSpy).toHaveBeenCalled();
    });

    it('drawLetters should call fillText as many times as letters and its value in a word array', () => {
        const wordPos: Vec2 = { x: 78, y: 78 };
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        const word = ['A1'];
        service['drawLetters'](word, wordPos);
        expect(fillTextSpy).toHaveBeenCalledTimes(word[0].length);
    });

    it('drawSpecialCase should call fillText as many times as words in a word array', () => {
        const wordPos: Vec2 = { x: 39, y: 39 };
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        const word = ['MOT', 'X3'];
        service['drawSpecialCase'](word, wordPos);
        expect(fillTextSpy).toHaveBeenCalledTimes(word.length);
    });

    it('drawHeader should call fillText once', () => {
        const wordPos: Vec2 = { x: 39, y: 0 };
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        const word = ['1'];
        service['drawHeader'](word, wordPos);
        expect(fillTextSpy).toHaveBeenCalledTimes(1);
    });

    it('renderRect should color pixels on the canvas after the board is initialized', () => {
        let imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.renderRect();
        imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it('renderRect should call drawWord', () => {
        const drawWordSpy = spyOn<any>(service, 'drawWord').and.callThrough();
        service.renderRect();
        expect(drawWordSpy).toHaveBeenCalled();
    });

    it('renderRect should call styleRect 256 times', () => {
        const drawWordSpy = spyOn<any>(service, 'styleRect').and.callThrough();
        service.renderRect();
        expect(drawWordSpy).toHaveBeenCalledTimes(256);
    });

    it('renderRect should call getRectWord', () => {
        const drawWordSpy = spyOn<any>(service, 'getRectWord').and.callThrough();
        service.renderRect();
        expect(drawWordSpy).toHaveBeenCalled();
    });

    it('renderRect should set the gridContext fillStyle to be the same as the easel Tile if its not empty', () => {
        const expectedColor = '#792e2e';
        const propertySpy = spyOnProperty(service.gridContext, 'fillStyle', 'get').and.returnValue(expectedColor);
        service.renderRect();
        expect(service.gridContext.fillStyle).toBe(expectedColor);
        expect(propertySpy).toHaveBeenCalled();
    });

    it('getRectWord should return an array of strings', () => {
        const stubNode = {
            tileType: 8,
            isEmpty: true,
            x: 0,
            y: 0,
        };
        const tileText = 'test';
        const wordArray = service['getRectWord'](stubNode, tileText);
        expect(wordArray).toEqual([tileText]);
    });

    it('getRectWord should return the node letter if its not empty', () => {
        const stubNode = {
            letter: {
                character: 'A',
                value: 7,
            },
            tileType: 8,
            isEmpty: true,
            x: 0,
            y: 0,
        };
        const tileText = 'test';
        const wordArray = service['getRectWord'](stubNode, tileText);
        const expected = ['A7'];
        expect(wordArray).toEqual(expected);
    });

    it('styleRect should call fillRect', () => {
        const wordPos: Vec2 = { x: 39, y: 0 };
        const drawWordSpy = spyOn(service.gridContext, 'fillRect').and.callThrough();
        service['styleRect'](wordPos);
        expect(drawWordSpy).toHaveBeenCalled();
    });

    it('renderRect should call getRowToChar 15 times', () => {
        const drawWordSpy = spyOn<any>(service, 'getRowToChar').and.callThrough();
        service.renderRect();
        expect(drawWordSpy).toHaveBeenCalledTimes(15);
    });

    it('drawGrid should call moveTo and lineTo 32 times', () => {
        const expectedCallTimes = 32;
        const moveToSpy = spyOn(service.gridContext, 'moveTo').and.callThrough();
        const lineToSpy = spyOn(service.gridContext, 'lineTo').and.callThrough();
        service.drawGrid();
        expect(moveToSpy).toHaveBeenCalledTimes(expectedCallTimes);
        expect(lineToSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it('drawGrid should color pixels on the canvas', () => {
        let imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawGrid();
        imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });
});
