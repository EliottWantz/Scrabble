import {
  Component,
  ElementRef,
  OnInit,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Game, ScrabbleGame } from '@app/utils/interfaces/game/game';
import { GameService } from '@app/services/game/game.service';
import { MouseService } from '@app/services/mouse/mouse.service';
import { MoveService } from '@app/services/game/move.service';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import { Tile } from '@app/utils/interfaces/game/tile';
import { UserService } from '@app/services/user/user.service';
import { Player } from '@app/utils/interfaces/game/player';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
    game!: BehaviorSubject<ScrabbleGame | undefined>;
    letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"];
    constructor(private gameService: GameService, private mouseService: MouseService, private moveService: MoveService,
      private userService: UserService) {
        this.game = this.gameService.scrabbleGame;
    }

  ngOnInit(): void {
    this.game.subscribe(() => {
      //console.log('game updated');
    });
  }

  @ViewChildren('elem') elements!: QueryList<ElementRef>;
  @ViewChildren('multis') multis!: QueryList<ElementRef>;
  clicked(row: number, col: number): void {
    const currentElem = this.elements.toArray()[row * 15 + col];
    const multiElem = this.multis.toArray()[row * 15 + col];
    console.log(this.gameService.scrabbleGame.value?.board);
    if (
      currentElem.nativeElement.children.length == 1 &&
      this.gameService.selectedTiles.length == 1 && !this.gameService.scrabbleGame.value?.board[row][col].tile?.letter
    ) {
      this.mouseService.place(currentElem.nativeElement, row, col);
      //multiElem.nativeElement.remove();
    }
  }

  getTextSquare(wordMultiplier: number, letterMultiplier: number): string {
    if (wordMultiplier == 2) {
      return 'DW';
    } else if (wordMultiplier == 3) {
      return 'TW';
    } else if (letterMultiplier == 2) {
      return 'DL';
    } else if (letterMultiplier == 3) {
      return 'TL';
    }
    return '';
  }

  drop(event: CdkDragDrop<string[]>) {
    console.log(event);
    console.log(event.dropPoint);
    console.log(document.elementFromPoint(event.dropPoint.x,event.dropPoint.y));
    console.log(event.previousContainer);
    this.gameService.selectedTiles = [];
    this.mouseService.resetColor();
    let bruh = document.elementFromPoint(event.dropPoint.x, event.dropPoint.y);
    if (document.getElementById("board")?.contains(bruh) == false && document.getElementById("rack")?.contains(bruh) == false) {
        return;
    }
    while (bruh && bruh?.tagName !== "MAT-GRID-TILE") {
      bruh = bruh.parentElement;
    }
    if (bruh?.classList.contains("bad")) {
      console.log("bad");
      return;
    }
    const x = Number(bruh?.getAttribute("data-x"));
    const y = Number(bruh?.getAttribute("data-y"));
    if (this.gameService.scrabbleGame.value?.board[x][y].tile?.letter) {
      return;
    }
    const elem = event.item.element.nativeElement;
    const tile : Tile = {letter: Number(elem.getAttribute("data-letter")), value: Number(elem.getAttribute("data-value"))};
    if (document.getElementById("board")?.contains(bruh) == true) {
      this.mouseService.place_drag_drop(elem, x, y, tile);
    }
    const oldX = event.previousContainer.element.nativeElement.dataset['x'];
    const oldY = event.previousContainer.element.nativeElement.dataset['y'];
    if (this.gameService.scrabbleGame.value && oldX && oldY) {
      const newBoard = this.gameService.scrabbleGame.value.board;
      /*if (this.gameService.scrabbleGame.value.board[parseInt(oldX)][parseInt(oldY)].tile) {
        console.log(this.gameService.scrabbleGame.value.board[parseInt(oldX)][parseInt(oldY)].tile);
        console.log(this.gameService.placedTiles);
        let deleted = false;
        for (let i = 0; i < this.gameService.placedTiles.length; i++) {
          if (!deleted && (this.gameService.placedTiles[i] == this.gameService.scrabbleGame.value.board[parseInt(oldX)][parseInt(oldY)].tile ||
            (this.gameService.placedTiles[i].letter == this.gameService.scrabbleGame.value.board[parseInt(oldX)][parseInt(oldY)].tile?.letter &&
            this.gameService.placedTiles[i].value == this.gameService.scrabbleGame.value.board[parseInt(oldX)][parseInt(oldY)].tile?.value && 
            this.gameService.placedTiles[i].x == this.gameService.scrabbleGame.value.board[parseInt(oldX)][parseInt(oldY)].tile?.x &&
            this.gameService.placedTiles[i].y == this.gameService.scrabbleGame.value.board[parseInt(oldX)][parseInt(oldY)].tile?.y))) {
              console.log("deleting placed");
              console.log(this.gameService.placedTiles);
            const newplaced = this.gameService.placedTiles.splice(i, 1);
            this.gameService.placedTiles = newplaced;
            console.log(newplaced);
            console.log(this.gameService.placedTiles);
            deleted = true;
          }
        }
      }*/
      console.log("deleting");
      newBoard[parseInt(oldX)][parseInt(oldY)].tile = undefined;
      this.gameService.scrabbleGame.next({...this.gameService.scrabbleGame.value, board: newBoard});
    }
    if (document.getElementById("rack")?.contains(bruh) == true && this.gameService.scrabbleGame.value) {
      if (this.gameService.scrabbleGame.value) {
        const players: Player[] = this.gameService.scrabbleGame.value.players;
        for (let i = 0; i < players.length; i++) {
          if (players[i].id == this.userService.currentUserValue.id) {
            players[i].rack.tiles.push({letter: tile.letter, value: tile.value, disabled: false});
          }
        }
      }
    }
  }
}
