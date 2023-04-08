import { Injectable } from '@angular/core';
import { Tile } from '@app/utils/interfaces/game/tile';
import { MoveService } from '@app/services/game/move.service';
import { GameService } from '@app/services/game/game.service';
import { Player } from '@app/utils/interfaces/game/player';
import { UserService } from '@app/services/user/user.service';

@Injectable({
  providedIn: 'root',
})
export class MouseService {
  tileElems: HTMLElement[] = [];
  constructor(
    private gameService: GameService,
    private userService: UserService
  ) {}

  place(row: number, col: number): void {
    if (
      this.tileElems.length == 1 &&
      this.gameService.selectedTiles.length == 1
    ) {
      //element.appendChild(this.tileElems[0]);
      this.tileElems[0].style.outlineColor = '#e6d9b7';
      this.tileElems = [];

      /*const indexMove = this.gameService.placedTiles.indexOf(
        this.gameService.selectedTiles[0],
        0
      );
      if (indexMove > -1) {
        this.gameService.placedTiles[indexMove] = {
          ...this.gameService.selectedTiles[0],
          x: col,
          y: row,
          disabled: false
        };
      } else {
        this.gameService.placedTiles.push({
          ...this.gameService.selectedTiles[0],
          x: col,
          y: row,
          disabled: false
        });*/
        if (this.gameService.scrabbleGame.value) {
          const newPlayers: Player[] = this.gameService.scrabbleGame.value.players;
          let deleted = false;
          for (let i = 0; i < this.gameService.scrabbleGame.value.players.length; i++) {
            if (this.gameService.scrabbleGame.value.players[i].id == this.userService.currentUserValue.id && !deleted) {
              for (let j = 0; j < this.gameService.scrabbleGame.value.players[i].rack.tiles.length; j++) {
                if (this.gameService.scrabbleGame.value.players[i].rack.tiles[j].letter == this.gameService.selectedTiles[0].letter && !deleted) {
                  newPlayers[i].rack.tiles.splice(j, 1);
                  deleted = true;
                }
              }
            }
          }
          this.gameService.scrabbleGame.next({...this.gameService.scrabbleGame.value, players: newPlayers});
        }
      }

      if (this.gameService.selectedTiles[0].letter < 97) {
        this.gameService.specialLetter( col, row);
      }

      
      if (this.gameService.scrabbleGame.value) {
        const newBoard = this.gameService.scrabbleGame.value.board;
        newBoard[row][col].tile = {
          ...this.gameService.selectedTiles[0],
          x: col,
          y: row,
          disabled: false
        };
        this.gameService.scrabbleGame.next({...this.gameService.scrabbleGame.value, board: newBoard});
        this.gameService.placedTiles++;
      }  

      //console.log(this.moveService.placedTiles);

      this.gameService.selectedTiles.splice(0, 1);
      //console.log(this.moveService.placedTiles);
      //console.log(this.moveService.selectedTiles);
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
      
      //this.gameService.placedTiles.push({ ...tile, x: col, y: row });
        if (tile.letter < 97) {
          this.gameService.specialLetter( col, row);
        } 
        if (this.gameService.scrabbleGame.value) {
          const newBoard = this.gameService.scrabbleGame.value?.board;
          //console.log(row);
          //console.log(col);
          newBoard[row][col].tile = {letter: tile.letter, value: tile.value, x: col, y: row, disabled: false};
          this.gameService.scrabbleGame.next({...this.gameService.scrabbleGame.value, board: newBoard});
          this.gameService.placedTiles++;
        }
        //console.log(this.moveService.placedTiles);
    //}
  }

  resetColor(): void {
    for (const elem of this.tileElems) {
      elem.style.outlineColor = '#e6d9b7';
    }
    this.tileElems = [];
  }
}
