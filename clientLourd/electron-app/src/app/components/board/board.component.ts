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

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
    game!: BehaviorSubject<ScrabbleGame | undefined>;
    constructor(private gameService: GameService, private mouseService: MouseService, private moveService: MoveService) {
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
    if (
      currentElem.nativeElement.children.length == 1 &&
      this.moveService.selectedTiles.length == 1
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
    let bruh = document.elementFromPoint(event.dropPoint.x, event.dropPoint.y);
    if (document.getElementById("board")?.contains(bruh) == false) {
        return;
    }
    if (bruh && bruh?.tagName === "DIV") {
        bruh = bruh.parentElement;
    }
    const x = Number(bruh?.getAttribute("data-x"));
    const y = Number(bruh?.getAttribute("data-y"));
    const elem = event.item.element.nativeElement;
    const tile : Tile = {letter: Number(elem.getAttribute("data-letter")), value: Number(elem.getAttribute("data-value"))};
    if (this.gameService.scrabbleGame.value && event.previousContainer.element.nativeElement.dataset['x'] && event.previousContainer.element.nativeElement.dataset['y']) {
      const newBoard = this.gameService.scrabbleGame.value.board;
      console.log("deleting");
      newBoard[parseInt(event.previousContainer.element.nativeElement.dataset['x'])][parseInt(event.previousContainer.element.nativeElement.dataset['y'])].tile = undefined;
      this.gameService.scrabbleGame.next({...this.gameService.scrabbleGame.value, board: newBoard});
    }
    this.mouseService.place_drag_drop(elem, x, y, tile);
  }
}
