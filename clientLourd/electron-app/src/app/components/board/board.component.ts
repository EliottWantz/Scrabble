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
import { ScrabbleGame } from '@app/utils/interfaces/game/game';
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
      private userService: UserService) {
        this.game = this.gameService.scrabbleGame;
    }

  ngOnInit(): void {
    this.gameService.dragging.subscribe((val) => {
      if (val && this.direction) {
        if (this.moveService.firstX !== -1 && this.moveService.firstY !== -1) {
          this.moveService.removedFirstTile();
        }
        this.direction.destroy();
        this.direction = undefined;
      }
    });
  }

  checkIfNewTile(tile: Tile | undefined): boolean {
    if (tile) {
      if (tile.letter === undefined) {
        return false;
      }
      if (tile.disabled === undefined) {
        return false;
      } else {
        return tile.disabled === false;
      }
    }
    return false;
  }

  @ViewChildren('elem', {read: ViewContainerRef}) elements!: QueryList<ViewContainerRef>;
  @ViewChildren('multis') multis!: QueryList<ElementRef>;

  clicked(row: number, col: number): void {
    if (!this.gameService.scrabbleGame.value?.board[row][col].tile?.letter && this.userService.currentUserValue.id == this.gameService.scrabbleGame.value?.turn) {
      if (this.gameService.dragging.value === true) {
        if (this.moveService.firstX !== -1 && this.moveService.firstY !== -1) {
          this.moveService.removedFirstTile();
        }
        this.gameService.resetSelectedAndPlaced();
        this.gameService.dragging.next(false);
      } else if (this.direction) {
        if (this.direction.instance.initialX !== col || this.direction.instance.initialY !== row) {
          if (this.moveService.firstX !== -1 && this.moveService.firstY !== -1) {
            this.moveService.removedFirstTile();
          }
          this.direction.destroy();
          this.direction = undefined;
          this.gameService.resetSelectedAndPlaced();
        } else {
          this.direction.instance.clicked();
          return;
        }
      }
      setTimeout(() => {
        if (this.gameService.placedTiles === 0) {
          this.moveService.firstX = col;
          this.moveService.firstY = row;
          this.moveService.placedFirstTile();
        }
        let clicked = this.elements.toArray()[row * 15 + col].element.nativeElement;
        while (clicked && clicked?.tagName !== "MAT-GRID-TILE") {
          clicked = clicked.parentElement;
        }
        if (clicked.tagName === "MAT-GRID-TILE") {
          this.direction = this.elements.toArray()[row * 15 + col].createComponent(DirectionComponent);
          this.direction.instance.x = col;
          this.direction.instance.y = row;
          this.direction.instance.initialY = row;
          this.direction.instance.initialX = col;
          clicked.appendChild(this.direction.location.nativeElement);
        }
      }, 100);
    }
  }

  @HostListener("document:click", ['$event'])
  clickout(event: any) {
    const elem = document.elementFromPoint(event.x,event.y);
    if (!document.getElementById("board")?.contains(elem) && this.direction) {
      if (this.moveService.firstX !== -1 && this.moveService.firstY !== -1) {
        this.moveService.removedFirstTile();
      }
      this.direction.destroy();
      this.direction = undefined;
      this.gameService.resetSelectedAndPlaced();
      //if (newGame) this.gameService.scrabbleGame.next(newGame);
    }
  }

  @HostListener("document:keyup", ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === "Enter" && this.gameService.placedTiles > 0) {
      this.moveService.playTiles();
    } else if (this.direction) {
      if (event.key === "Backspace") {
        this.removeLastLetter();
      } else {
        const key = event.key.charCodeAt(0);
        if (key > 64 && key < 91) {
          // Maj
          this.checkKey(true, key);
        } else if (key > 96 && key < 123) {
          // Normal
          this.checkKey(false, key);
        }
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
            const oldTile = newBoard[y][x].tile as Tile;
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
            if (newBoard[y][x] && newPlayers[i].rack.tiles[j].letter === letterToSearch) {
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
    this.gameService.selectedTiles = [];
    this.mouseService.resetColor();
    let clickedElem = document.elementFromPoint(event.dropPoint.x, event.dropPoint.y);
    if (document.getElementById("board")?.contains(clickedElem) == false && document.getElementById("rack")?.contains(clickedElem) == false) {
        return;
    }
    if (this.gameService.dragging.value === false) {
      if (this.moveService.firstX !== -1 && this.moveService.firstY !== -1) {
        this.moveService.removedFirstTile();
      }
      this.gameService.resetSelectedAndPlaced();
    }
    setTimeout(() => {
      this.gameService.dragging.next(true);
      if (clickedElem?.classList.contains("bad")) {
        return;
      }
      const elem = event.item.element.nativeElement;
      const tile : Tile = {letter: Number(elem.getAttribute("data-letter")), value: Number(elem.getAttribute("data-value"))};
      const oldX = event.previousContainer.element.nativeElement.dataset['x'];
      const oldY = event.previousContainer.element.nativeElement.dataset['y'];
      if (document.getElementById("board")?.contains(clickedElem) == true) {
        while (clickedElem && clickedElem?.tagName !== "MAT-GRID-TILE") {
          clickedElem = clickedElem.parentElement;
        }
        const x = Number(clickedElem?.getAttribute("data-x"));
        const y = Number(clickedElem?.getAttribute("data-y"));

        if (this.gameService.scrabbleGame.value?.board[x][y].tile?.letter) {
          console.log("has letter");
          return;
        }
        if (this.gameService.scrabbleGame.value && oldX && oldY) {
          if (this.moveService.firstX !== -1 && this.moveService.firstY !== -1 && this.gameService.placedTiles === 1) {
            this.moveService.removedFirstTile();
          }
          const newBoard = this.gameService.scrabbleGame.value.board;
          newBoard[parseInt(oldX)][parseInt(oldY)].tile = undefined;
          this.gameService.placedTiles--;
        }
        if (this.gameService.placedTiles === 0) {
          this.moveService.firstX = y;
          this.moveService.firstY = x;
          this.moveService.placedFirstTile();
        }
        this.mouseService.place_drag_drop(x, y, tile);
      } else if (document.getElementById("rack")?.contains(clickedElem) == true && this.gameService.scrabbleGame.value  && oldX && oldY) {
          console.log("rack");
          if (this.gameService.scrabbleGame.value) {
            const players: Player[] = this.gameService.scrabbleGame.value.players;
            for (let i = 0; i < players.length; i++) {
              if (players[i].id == this.userService.currentUserValue.id) {
                if (this.gameService.scrabbleGame.value.board[parseInt(oldX)][parseInt(oldY)].tile) {
                  if (this.moveService.firstX !== -1 && this.moveService.firstY !== -1 && this.gameService.placedTiles === 1) {
                    this.moveService.removedFirstTile();
                  }
                  players[i].rack.tiles.push(this.gameService.scrabbleGame.value.board[parseInt(oldX)][parseInt(oldY)].tile as Tile);
                  const newBoard = this.gameService.scrabbleGame.value.board;
                  newBoard[parseInt(oldX)][parseInt(oldY)].tile = undefined;
                  this.gameService.placedTiles--;
                  this.gameService.scrabbleGame.next({...this.gameService.scrabbleGame.value, board: newBoard, players: players});
                  return;
                }
              }
            }
          }
        }
    }, 100);
    
  }
}
