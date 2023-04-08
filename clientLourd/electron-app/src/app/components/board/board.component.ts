import {
  Component,
  ElementRef,
  OnInit,
  ViewChildren,
  QueryList,
  ViewContainerRef,
  ComponentRef,
  HostListener
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
import { DirectionComponent } from '@app/components/direction/direction.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
    game!: BehaviorSubject<ScrabbleGame | undefined>;
    letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"];
    direction: ComponentRef<DirectionComponent> | undefined;
    constructor(private gameService: GameService, private mouseService: MouseService, private moveService: MoveService,
      private userService: UserService, private viewContainerRef: ViewContainerRef, private eRef: ElementRef) {
        this.game = this.gameService.scrabbleGame;
        this.gameService.dragging.subscribe((val) => {
          if (val && this.direction)
            this.direction.destroy();
        });
    }

  ngOnInit(): void {
    this.game.subscribe(() => {
      //console.log('game updated');
    });
  }

  @ViewChildren('elem', {read: ViewContainerRef}) elements!: QueryList<ViewContainerRef>;
  @ViewChildren('multis') multis!: QueryList<ElementRef>;
  clicked(row: number, col: number): void {
    if (this.gameService.dragging.value === true) {
      console.log("????");
      this.gameService.resetSelectedAndPlaced();
      console.log(this.gameService.scrabbleGame.value);
      console.log(this.gameService.oldGame);
    }
    if (!this.gameService.scrabbleGame.value?.board[row][col].tile?.letter && this.userService.currentUserValue.id == this.gameService.scrabbleGame.value?.turn) {
      this.gameService.dragging.next(false);
      console.log(this.elements.toArray()[row * 15 + col].element.nativeElement.children);
      let clicked = this.elements.toArray()[row * 15 + col].element.nativeElement;
      while (clicked && clicked?.tagName !== "MAT-GRID-TILE") {
        clicked = clicked.parentElement;
      }
      console.log(clicked);
      if (clicked.tagName === "MAT-GRID-TILE") {
        if (!this.direction || this.direction.instance.x !== col || this.direction.instance.y !== row) {
          if (this.direction) {
            this.direction.destroy();
            this.gameService.resetSelectedAndPlaced();
          }
          console.log("created direction");
          this.direction = this.elements.toArray()[row * 15 + col].createComponent(DirectionComponent);
          this.direction.instance.x = col;
          this.direction.instance.y = row;
          this.direction.instance.initialY = row;
          this.direction.instance.initialX = col;
          clicked.appendChild(this.direction.location.nativeElement);
          /*const multiElem = this.multis.toArray()[row * 15 + col];
          multiElem.nativeElement.remove();*/
        } else {
          console.log("switching");
          this.direction.instance.clicked();
        }
      }
    }
  }

  @HostListener("document:click", ['$event'])
  clickout(event: any) {
    console.log(event);
    const elem = document.elementFromPoint(event.x,event.y);
    console.log(elem);
    if (!document.getElementById("board")?.contains(elem) && this.direction) {
      this.direction.destroy();
      this.gameService.resetSelectedAndPlaced();
    }
  }

  @HostListener("document:keyup", ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.direction) {
      if (event.key === "Backspace") {
        this.removeLastLetter();
      } else if (event.key === "Enter") {
        this.moveService.playTiles();
      } else {
        const key = event.key.charCodeAt(0);
        this.checkKey(key < 97, key);
      }
    }
  }

  private removeLastLetter(): void {
    if (this.gameService.scrabbleGame.value) {
      if (this.direction) {
        if (this.direction && this.direction.instance.horizontal) {
          this.direction.instance.x--;
          while (this.direction.instance.x > this.direction.instance.initialX && this.gameService.scrabbleGame.value.board[this.direction.instance.y][this.direction.instance.x].tile && this.gameService.scrabbleGame.value.board[this.direction.instance.y][this.direction.instance.x].tile?.disabled)
            this.direction.instance.x--;
        } else {
          this.direction.instance.y--;
          while (this.direction.instance.y > this.direction.instance.initialY && this.gameService.scrabbleGame.value.board[this.direction.instance.y][this.direction.instance.x].tile && this.gameService.scrabbleGame.value.board[this.direction.instance.y][this.direction.instance.x].tile?.disabled)
            this.direction.instance.y--;
        }
        this.removeLetter(this.direction.instance.x, this.direction.instance.y);
      }
    }
  }

  private removeLetter(x: number, y: number): void {
    if (this.gameService.scrabbleGame.value) {
      const newBoard = this.gameService.scrabbleGame.value.board;
      const newPlayers = this.gameService.scrabbleGame.value.players;
      for (let i = 0; i < newPlayers.length; i++) {
        if (newPlayers[i].id == this.userService.currentUserValue.id) {
          if (newBoard[y][x].tile) {
            console.log(newBoard[y][x])
            const oldTile = newBoard[y][x].tile as Tile;
            console.log(oldTile);
            console.log(newBoard);
            console.log(this.gameService.scrabbleGame.value.board);
            if (oldTile.letter >= 97) {
              newPlayers[i].rack.tiles.push({letter: oldTile.letter, value: oldTile.value, disabled: false});
            } else {
              newPlayers[i].rack.tiles.push({letter: 42, value: 0, disabled: false});
            }
          }
          newBoard[y][x].tile = undefined;
          this.gameService.scrabbleGame.next({...this.gameService.scrabbleGame.value, board: newBoard, players: newPlayers});
          this.gameService.placedTiles--;
          return;
        }
      }
    }
  }

  private checkKey(isSpecial: boolean, key: number): void {
    let tempKey = key;
    if (isSpecial) {
      tempKey = 42;
    }
    if (this.direction) {
      this.placeLetter(tempKey, this.direction.instance.x, this.direction.instance.y, key);
      if (this.gameService.scrabbleGame.value) {
        if (this.direction.instance.horizontal) {
          while (this.direction.instance.x < 15 && this.gameService.scrabbleGame.value.board[this.direction.instance.y][this.direction.instance.x].tile && this.gameService.scrabbleGame.value.board[this.direction.instance.y][this.direction.instance.x].tile?.letter)
            this.direction.instance.x++;
        } else {
          while (this.direction.instance.y < 15 && this.gameService.scrabbleGame.value.board[this.direction.instance.y][this.direction.instance.x].tile && this.gameService.scrabbleGame.value.board[this.direction.instance.y][this.direction.instance.x].tile?.letter)
            this.direction.instance.y++;
        }
      }
    }
  }

  private placeLetter(letterToSearch: number, x: number, y: number, letterToAdd: number): void {
    if (this.gameService.scrabbleGame.value) {
      const newBoard = this.gameService.scrabbleGame.value.board;
      const newPlayers = this.gameService.scrabbleGame.value.players;
      for (let i = 0; i < newPlayers.length; i++) {
        if (newPlayers[i].id == this.userService.currentUserValue.id) {
          for (let j = 0; j < newPlayers[i].rack.tiles.length; j++) {
            if (newPlayers[i].rack.tiles[j].letter === letterToSearch) {
              newBoard[y][x].tile = {value: newPlayers[i].rack.tiles[j].value, letter: letterToAdd, x: x, y: y, disabled: false};
              newPlayers[i].rack.tiles.splice(j, 1);
              this.gameService.scrabbleGame.next({...this.gameService.scrabbleGame.value, board: newBoard, players: newPlayers});
              this.gameService.placedTiles++;
              return;
            }
          }
        }
      }
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
