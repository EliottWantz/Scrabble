import { Injectable } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
import {
    BLOCK_SIZE,
    BOARD_LENGTH,
    COL_IDX,
    COL_START,
    DEFAULT_FONT_SIZE,
    DEFAULT_GRID_LINE_WIDTH,
    DEFAULT_HEIGHT,
    DEFAULT_LINE_GRID_COLOR,
    DEFAULT_WIDTH,
    FONT_WORD_SPACER,
    GRID_FONT_COLOR,
    GRID_TILE_OFFSET,
    LETTER_CENTER_FACTOR,
    LETTER_FONT_MULTIPLIER,
    LETTER_LINE_HEIGHT,
    LETTER_MULTIPLIER,
    ROW_DICT,
    ROW_IDX,
    ROW_OFFSET,
    ROW_START,
    TILE_PROPERTIES,
    WORD_SKIPPER,
    X_OFFSET,
} from '@app/utils/constants/grid-constants';
import { COLOR } from '@app/utils/enums/grid';
import { Vec2 } from '@app/utils/Interface/vec2';
import { Node } from '@common/grid/node';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class GridService {
    grid$: Observable<Node[][]>;
    grid: Node[][];
    gridContext: CanvasRenderingContext2D;
    fontTileSize: number;
    private canvasSize: Vec2;

    constructor(private gameService: GameService) {
        this.fontTileSize = DEFAULT_FONT_SIZE;
        this.canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
    }

    init(): void {
        this.grid$ = this.gameService.game$.pipe(map((game) => game.grid));
    }

    get width(): number {
        return this.canvasSize.x;
    }
    get height(): number {
        return this.canvasSize.y;
    }

    drawGrid(): void {
        this.gridContext.strokeStyle = DEFAULT_LINE_GRID_COLOR;
        this.gridContext.lineWidth = DEFAULT_GRID_LINE_WIDTH;
        for (let row = 0; row <= this.canvasSize.x; row += BLOCK_SIZE) {
            if (row === 0) continue;
            this.gridContext.beginPath();
            this.gridContext.moveTo(ROW_START, row);
            this.gridContext.lineTo(this.canvasSize.y, row);
            this.gridContext.stroke();
        }
        for (let col = 0; col <= this.canvasSize.y; col += BLOCK_SIZE) {
            if (col === 0) continue;
            this.gridContext.beginPath();
            this.gridContext.moveTo(col, COL_START);
            this.gridContext.lineTo(col, this.canvasSize.y);
            this.gridContext.stroke();
        }
    }

    renderRect(): void {
        for (let row = 0; row <= BOARD_LENGTH; row++) {
            for (let col = 0; col <= BOARD_LENGTH; col++) {
                const pos = { x: col * BLOCK_SIZE, y: row * BLOCK_SIZE };
                const node = this.grid[row][col];
                const tileType: number = node.tileType;
                const tile = Object.values(TILE_PROPERTIES)[tileType];
                if (tileType === COL_IDX) {
                    tile.text = `${col}`;
                } else if (tileType === ROW_IDX) {
                    tile.text = this.getRowToChar(row - ROW_OFFSET);
                }
                if (node.isEmpty) {
                    this.gridContext.fillStyle = tile.color;
                } else {
                    this.gridContext.fillStyle = COLOR.Tile;
                }
                this.styleRect(pos);
                const tileWord = this.getRectWord(node, tile.text);
                this.drawWord(tileWord, pos);
            }
        }
    }
    drawLetters(word: string[], pos: Vec2): void {
        this.gridContext.fillStyle = COLOR.White;
        for (let i = 0; i < 2; i++) {
            if (i === ROW_START) {
                this.gridContext.font = `${this.fontTileSize * LETTER_FONT_MULTIPLIER}px Arial`;
                this.gridContext.fillText(
                    word[0][i],
                    pos.x + (BLOCK_SIZE - this.gridContext.measureText(word[0][i]).width) / 2 + i * X_OFFSET,
                    pos.y + BLOCK_SIZE / 2 + LETTER_LINE_HEIGHT / 3 + LETTER_CENTER_FACTOR,
                );
            } else {
                this.gridContext.font = `${this.fontTileSize}px Arial`;
                this.gridContext.fillText(
                    word[0].slice(WORD_SKIPPER),
                    pos.x + (BLOCK_SIZE - this.gridContext.measureText(word[0].slice(WORD_SKIPPER)).width) / 2 + i * X_OFFSET,
                    pos.y + BLOCK_SIZE / 2 + LETTER_LINE_HEIGHT / 3 + LETTER_CENTER_FACTOR,
                );
            }
        }
    }

    clearCanvas(canvas: CanvasRenderingContext2D): void {
        canvas.clearRect(0, 0, this.width, this.height);
        this.drawGrid();
        this.renderRect();
    }

    drawHeader(word: string[], pos: Vec2): void {
        this.gridContext.font = `${this.fontTileSize * LETTER_MULTIPLIER}px Arial`;
        this.gridContext.fillText(
            word[0],
            pos.x + (BLOCK_SIZE - this.gridContext.measureText(word[0]).width) / 2,
            pos.y + BLOCK_SIZE / 2 + LETTER_LINE_HEIGHT / 3 + LETTER_CENTER_FACTOR,
        );
    }
    private getRowToChar(row: number): string {
        return Object.values(ROW_DICT)[row];
    }

    private getRectWord(node: Node, tileText: string): string[] {
        const letter = node.letter;
        let word: string;
        if (letter) {
            word = letter.character.toUpperCase() + letter.value;
        } else {
            word = tileText;
        }
        return word.split('\n');
    }

    private styleRect(pos: Vec2): void {
        this.gridContext.fillRect(
            pos.x + GRID_TILE_OFFSET.x,
            pos.y + GRID_TILE_OFFSET.x,
            BLOCK_SIZE - GRID_TILE_OFFSET.y,
            BLOCK_SIZE - GRID_TILE_OFFSET.y,
        );
    }

    private drawWord(word: string[], pos: Vec2): void {
        if (word[0] === '') return;
        this.gridContext.fillStyle = GRID_FONT_COLOR;
        if (word.length !== 1) {
            this.drawSpecialCase(word, pos);
        } else if ((word[0].length === 2 || word[0].length === 3) && pos.y >= BLOCK_SIZE) {
            this.drawLetters(word, pos);
        } else {
            this.drawHeader(word, pos);
        }
    }

    private drawSpecialCase(word: string[], pos: Vec2): void {
        this.gridContext.font = `${this.fontTileSize}px Arial`;
        for (let i = 0; i < word.length; i++) {
            const textWidth = this.gridContext.measureText(word[i]).width;
            this.gridContext.fillText(
                word[i],
                pos.x + (BLOCK_SIZE - textWidth) / 2,
                pos.y + BLOCK_SIZE / 2 + i * FONT_WORD_SPACER - GRID_TILE_OFFSET.y,
            );
        }
    }
}
