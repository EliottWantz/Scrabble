import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
import { GridService } from '@app/services/grid/grid.service';
import { MousePlacementService } from '@app/services/mouse-placement/mouse-placement.service';
import { MouseButton } from '@app/utils/enums/mouse';
import { Vec2 } from '@app/utils/Interface/vec2';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements AfterViewInit {
    @ViewChild('gridCanvas', { static: false }) private gridCanvas!: ElementRef<HTMLCanvasElement>;
    gameEnded: boolean;

    constructor(private gameService: GameService, public gridService: GridService, public mousePlacementService: MousePlacementService) {
        this.gridService.init();
        this.gameService.game$.subscribe((game) => {
            this.gameEnded = game.hasEnded;
        });
    }

    @HostListener('document:click', ['$event'])
    onClickOut(event: MouseEvent): void {
        if (!this.gridCanvas.nativeElement.contains(event.target as Node)) {
            this.mousePlacementService.cancelPlacement();
            this.mousePlacementService.isBoardFocused = false;
        } else this.mousePlacementService.isBoardFocused = true;
    }

    ngAfterViewInit(): void {
        this.gridService.gridContext = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridCanvas.nativeElement.focus();
        this.gridService.grid$.subscribe((grid) => {
            this.gridService.grid = grid;
            this.gridService.drawGrid();
            this.gridService.renderRect();
        });
    }

    onMouseClick(event: MouseEvent): void {
        if (this.gameEnded) {
            this.mousePlacementService.cancelPlacement();
        } else if (event.button === MouseButton.Left) {
            const pos: Vec2 = { x: event.offsetX, y: event.offsetY };
            this.mousePlacementService.setMarker(pos);
        }
    }
}
