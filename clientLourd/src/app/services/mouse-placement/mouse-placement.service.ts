import { Injectable } from '@angular/core';
import { ChatService } from '@app/services/chat/chat.service';
import { CommandService } from '@app/services/command/command.service';
import { EaselService } from '@app/services/easel/easel.service';
import { GridService } from '@app/services/grid/grid.service';
import { PlayerService } from '@app/services/player/player.service';
import { BLOCK_SIZE, BOARD_LENGTH, DEFAULT_WIDTH, ROW_DICT_MIN } from '@app/utils/constants/grid-constants';
import { COLOR, LetterOrientation } from '@app/utils/enums/grid';
import { Vec2 } from '@app/utils/Interface/vec2';
import { Command, CommandError, CommandName } from '@common/command';
import { Direction } from '@common/grid/direction';
import { LETTER_VALUES } from '@common/grid/letterValue';
import { Letter } from '@common/grid/node';
import { Player } from '@common/player';

export interface BoardPos {
    row: number;
    col: number;
    letter?: Letter;
}

@Injectable({
    providedIn: 'root',
})
export class MousePlacementService {
    player: Player;
    letterPositions: BoardPos[];
    marker: BoardPos;
    isBoardFocused: boolean;
    isMarkerVisible: boolean;
    isUpperCase: boolean;
    orientation: string;

    constructor(
        private chatService: ChatService,
        private gridService: GridService,
        private playerService: PlayerService,
        private commandService: CommandService,
        private easelService: EaselService,
    ) {
        this.letterPositions = [];
        this.isUpperCase = false;
        this.orientation = Direction.Horizontal;
    }

    init(): void {
        this.playerService.player$.subscribe((player) => (this.player = player));
    }

    setMarker(coords: Vec2): void {
        const boardPos: BoardPos | undefined = this.getVecToBoardPos(coords);
        if (this.letterPositions.length > 0 || !boardPos || !this.player.isPlaying || !this.isTileEmpty(boardPos)) return;
        const prevMarker: BoardPos | null = this.marker ? this.marker : null;
        this.isMarkerVisible = true;
        this.marker = boardPos;
        if ((prevMarker?.row as number) === this.marker.row && ((prevMarker as BoardPos).col as number) === this.marker.col) this.switchOrientation();
        else this.orientation = Direction.Horizontal;
        this.renderRect();
    }

    addLetter(letter: string): void {
        letter = this.easelService.removeLetterAccent(letter);
        if (!this.player.isPlaying || !this.easelService.hasLetters(letter, this.player.easel) || !this.isMarkerVisible) return;
        if (letter === letter.toUpperCase()) this.isUpperCase = true;
        const letterPos: BoardPos = { ...this.marker };
        letterPos.letter = { character: letter, value: LETTER_VALUES.get(letter.toLowerCase()) as number };
        const nextMarker: BoardPos = this.getNextIncrementedMarker();
        this.letterPositions.push(letterPos);
        this.removeLetterFromRack(letter, this.player.easel);
        if (this.isMarkerValid(nextMarker)) this.incrementMarkerPosition();
        else this.isMarkerVisible = false;
        this.renderRect();
    }

    cancelPreviousPlacement(): void {
        if (!this.player.isPlaying || this.letterPositions.length <= 0) return;
        const letterToAdd: BoardPos = this.letterPositions.pop() as BoardPos;
        this.addLetterToRack(
            this.player.easel,
            ((letterToAdd.letter as Letter).character as string) === ((letterToAdd.letter as Letter).character.toUpperCase() as string)
                ? '*'
                : ((letterToAdd.letter as Letter).character as string),
        );
        if (this.isMarkerVisible) this.decrementMarkerPosition();
        else {
            this.isMarkerVisible = true;
            this.marker.row = (letterToAdd as BoardPos).row as number;
            this.marker.col = (letterToAdd as BoardPos).col as number;
        }
        this.renderRect();
    }

    cancelPlacement(): void {
        this.isMarkerVisible = false;
        this.orientation = Direction.Horizontal;
        this.removeLettersPlaced();
    }

    async confirmPlacement(): Promise<void> {
        if (!this.player.isPlaying || this.letterPositions.length <= 0) return;
        const command = this.getPlacementCommand();
        const error: CommandError = (await this.commandService.throwsError(command)) as CommandError;
        this.removeLettersPlaced();
        if (!error) {
            const parsedCommand = this.commandService.parseCommand(command) as Command;
            this.chatService.sendCommand(parsedCommand);
        } else {
            this.chatService.showError(error);
        }
    }

    // Marker manipulation
    private getNextIncrementedMarker(): BoardPos {
        const nextMarker: BoardPos = { ...this.marker };
        if (this.orientation === Direction.Horizontal) {
            nextMarker.col++;
        } else nextMarker.row++;
        return nextMarker;
    }

    private incrementMarkerPosition(): void {
        if (this.orientation === Direction.Horizontal) {
            this.marker.col++;
        } else this.marker.row++;
        while (!this.isTileEmpty(this.marker)) {
            if (this.orientation === Direction.Horizontal) {
                this.marker.col++;
            } else this.marker.row++;
        }
    }

    private decrementMarkerPosition(): void {
        if (this.orientation === Direction.Horizontal && this.isMarkerVisible) {
            this.marker.col--;
        } else this.marker.row--;
        while (!this.isTileEmpty(this.marker)) {
            if (this.orientation === Direction.Horizontal) {
                this.marker.col--;
            } else this.marker.row--;
        }
    }

    // Command validation
    private getPlacementCommand(): string {
        const command = `!${CommandName.Place} ` + this.getCommandParams() + ' ' + this.getCommandLetters();
        return command;
    }

    private getCommandParams(): string {
        const firstLetter = this.letterPositions[0];
        const params = this.getRowToChar(firstLetter.row - 1) + firstLetter.col + this.orientation;
        return params;
    }

    private getCommandLetters(): string {
        let letters = '';
        for (const letter of this.letterPositions) {
            letters += letter.letter?.character as string;
        }
        return letters;
    }

    // Rack manipulation
    private removeLetterFromRack(letterToRemove: string, playerEasel: Letter[]): void {
        const letterRemove = this.isUpperCase ? '*' : letterToRemove;
        const letterIndex = playerEasel.findIndex((letter) => letter.character === letterRemove);
        playerEasel.splice(letterIndex, 1);
        this.isUpperCase = false;
    }

    private removeLettersPlaced(): void {
        for (let i = this.letterPositions.length - 1; i >= 0; i--) {
            this.addLetterToRack(this.player.easel, (this.letterPositions[i].letter as Letter).character as string);
        }
        this.letterPositions = [];
        this.gridService.clearCanvas(this.gridService.gridContext);
    }

    private addLetterToRack(playerEasel: Letter[], letter: string): void {
        const newLetter: Letter = { character: letter, value: LETTER_VALUES.get(letter.toLowerCase()) as number };
        playerEasel.push(newLetter);
    }

    // Board Validation
    private switchOrientation(): void {
        this.orientation = this.orientation === Direction.Horizontal ? Direction.Vertical : Direction.Horizontal;
    }

    private getOrientation(): string {
        return this.orientation === Direction.Horizontal ? LetterOrientation.Horizontal : LetterOrientation.Vertical;
    }

    private getVecToBoardPos(coords: Vec2): BoardPos | undefined {
        if (this.isPosValid(coords.x) && this.isPosValid(coords.y)) {
            const currCol = Math.floor(coords.x / BLOCK_SIZE);
            const currRow = Math.floor(coords.y / BLOCK_SIZE);
            const boardPos = {
                row: currRow,
                col: currCol,
            };
            return boardPos;
        }
        return;
    }

    private getRowToChar(row: number): string {
        return Object.values(ROW_DICT_MIN)[row];
    }

    private isTileEmpty(boardPos: BoardPos) {
        return this.gridService.grid[boardPos.row][boardPos.col].isEmpty;
    }

    private isMarkerValid(marker: BoardPos): boolean {
        return marker.col <= BOARD_LENGTH && marker.row <= BOARD_LENGTH;
    }

    private isPosValid(pos: number): boolean {
        return pos >= BLOCK_SIZE && pos <= DEFAULT_WIDTH;
    }

    // Render
    private renderRect(): void {
        this.gridService.clearCanvas(this.gridService.gridContext);
        if (this.marker && this.isMarkerVisible) {
            const pos: Vec2 = { x: this.marker.col * BLOCK_SIZE, y: this.marker.row * BLOCK_SIZE };
            this.gridService.gridContext.fillStyle = COLOR.MouseShadowPlace;
            this.gridService.gridContext.fillRect(pos.x, pos.y, BLOCK_SIZE, BLOCK_SIZE);
            this.gridService.gridContext.fillStyle = COLOR.White;
            this.gridService.drawHeader([this.getOrientation()], pos);
        }
        if (this.letterPositions.length > 0) {
            for (const letter of this.letterPositions) {
                const pos: Vec2 = { x: letter.col * BLOCK_SIZE, y: letter.row * BLOCK_SIZE };
                this.gridService.gridContext.fillStyle = COLOR.MousePlace;
                this.gridService.gridContext.fillRect(pos.x, pos.y, BLOCK_SIZE, BLOCK_SIZE);
                this.gridService.gridContext.fillStyle = COLOR.White;
                this.gridService.drawLetters([((letter.letter as Letter).character.toUpperCase() as string) + (letter.letter as Letter).value], pos);
                this.drawBorder(pos);
            }
        }
    }

    private drawBorder(coords: Vec2): void {
        this.gridService.gridContext.strokeStyle = COLOR.Yellow;
        this.gridService.gridContext.lineWidth = 3;
        for (let row = coords.x; row < coords.x + 2 * BLOCK_SIZE; row += BLOCK_SIZE) {
            this.gridService.gridContext.beginPath();
            this.gridService.gridContext.moveTo(row, coords.y);
            this.gridService.gridContext.lineTo(row, coords.y + BLOCK_SIZE);
            this.gridService.gridContext.stroke();
        }

        for (let col = coords.y; col < coords.y + 2 * BLOCK_SIZE; col += BLOCK_SIZE) {
            this.gridService.gridContext.beginPath();
            this.gridService.gridContext.moveTo(coords.x, col);
            this.gridService.gridContext.lineTo(coords.x + BLOCK_SIZE, col);
            this.gridService.gridContext.stroke();
        }
    }
}
