import { Injectable } from '@angular/core';
import { Tile } from '@app/utils/interfaces/game/tile';
import { MoveService } from '@app/services/game/move.service';
import { RackService } from '@app/services/game/rack.service';
import { GameService } from '@app/services/game/game.service';

@Injectable({
  providedIn: 'root',
})
export class MouseService {
  tileElems: HTMLElement[] = [];
  constructor(
    private moveService: MoveService,
    private rackService: RackService,
    private gameService: GameService
  ) {}

  place(element: HTMLElement, row: number, col: number): void {
    if (
      this.tileElems.length == 1 &&
      this.moveService.selectedTiles.length == 1
    ) {
      //element.appendChild(this.tileElems[0]);
      this.rackService.placedTiles.push(element);
      this.tileElems[0].style.outlineColor = '#e6d9b7';
      this.tileElems = [];

      const indexMove = this.moveService.placedTiles.indexOf(
        this.moveService.selectedTiles[0],
        0
      );
      if (indexMove > -1) {
        this.moveService.selectedTiles[0] = {
          ...this.moveService.selectedTiles[0],
          x: col,
          y: row,
        };
        this.moveService.placedTiles[indexMove] = {
          ...this.moveService.selectedTiles[0],
          x: col,
          y: row,
        };
      } else {
        this.moveService.placedTiles.push({
          ...this.moveService.selectedTiles[0],
          x: col,
          y: row,
        });
      }

      const index = this.moveService.placedTiles.indexOf(this.moveService.selectedTiles[0], 0);
      if (this.moveService.selectedTiles[0].letter < 97) {
        //const indexMove = this.moveService.placedTiles.indexOf(this.moveService.selectedTiles[0], 0);
        this.gameService.specialLetter(indexMove);
      }

      
      if (this.gameService.scrabbleGame.value) {
        const newBoard = this.gameService.scrabbleGame.value?.board;
        newBoard[row][col].tile = this.moveService.placedTiles[index];
        this.gameService.scrabbleGame.next({...this.gameService.scrabbleGame.value, board: newBoard});
      }
      

      //console.log(this.moveService.placedTiles);

      this.moveService.selectedTiles.splice(0, 1);
      //console.log(this.moveService.placedTiles);
      //console.log(this.moveService.selectedTiles);
    }
  }

  place_drag_drop(
    element: HTMLElement,
    row: number,
    col: number,
    tile: Tile
  ): void {
    //const elem = document.querySelector(`[data-x="${row}"][data-y="${col}"]`);
    //if (elem) {
      //if (elem.children.length == 1 && elem.children[0].tagName == 'DIV') {
        //elem.removeChild(elem.children[0]);
        //elem.appendChild(element);
        /*const index = this.moveService.placedTiles.indexOf()
        if ()*/
        
      //}
      this.moveService.placedTiles.push({ ...tile, x: col, y: row });
        if (tile.letter < 97) {
          this.gameService.specialLetter(this.moveService.placedTiles.length - 1);
        }

        if (this.gameService.scrabbleGame.value) {
          const newBoard = this.gameService.scrabbleGame.value?.board;
          //console.log(row);
          //console.log(col);
          newBoard[row][col].tile = this.moveService.placedTiles[this.moveService.placedTiles.length - 1];
          this.gameService.scrabbleGame.next({...this.gameService.scrabbleGame.value, board: newBoard});
        }
        //console.log(this.moveService.placedTiles);
    //}
  }
}
