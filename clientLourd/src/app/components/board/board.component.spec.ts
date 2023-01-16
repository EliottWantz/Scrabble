/* eslint-disable dot-notation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameService } from '@app/services/game/game.service';
import { GridService } from '@app/services/grid/grid.service';
import { MousePlacementService } from '@app/services/mouse-placement/mouse-placement.service';
import { stubGame } from '@app/utils/mocks/game';
import { Game } from '@common/game';
import { BehaviorSubject, of } from 'rxjs';
import { BoardComponent } from './board.component';
describe('BoardComponent', () => {
    let component: BoardComponent;
    let fixture: ComponentFixture<BoardComponent>;
    let gridServiceSpy: jasmine.SpyObj<GridService>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let mousePlacementServiceSpy: jasmine.SpyObj<MousePlacementService>;

    beforeEach(async () => {
        gameServiceSpy = jasmine.createSpyObj('GameService', [], {
            game$: new BehaviorSubject<Game>(stubGame),
        });
        gridServiceSpy = jasmine.createSpyObj('GridService', ['init', 'drawGrid', 'renderRect'], { grid$: of(stubGame.grid) });
        mousePlacementServiceSpy = jasmine.createSpyObj('MousePlacementService', ['init', 'cancelPlacement', 'setMarker']);
        await TestBed.configureTestingModule({
            declarations: [BoardComponent],
            providers: [
                { provide: GridService, useValue: gridServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
                { provide: MousePlacementService, useValue: mousePlacementServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        gridServiceSpy = TestBed.inject(GridService) as jasmine.SpyObj<GridService>;
        fixture = TestBed.createComponent(BoardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngAfterViewInit should call drawGrid', () => {
        component.ngAfterViewInit();
        expect(gridServiceSpy.drawGrid).toHaveBeenCalled();
    });

    it('ngAfterViewInit should call renderRect', () => {
        component.ngAfterViewInit();
        expect(gridServiceSpy.renderRect).toHaveBeenCalled();
    });

    it('ngAfterViewInit should set the grid', () => {
        const expectedGrid = stubGame.grid;
        component.ngAfterViewInit();
        expect(gridServiceSpy.grid).toEqual(expectedGrid);
    });
    it('ngAfterViewInit should set the grid', () => {
        const expectedGrid = stubGame.grid;
        component.ngAfterViewInit();
        expect(gridServiceSpy.grid).toEqual(expectedGrid);
    });

    it('onClickOut should call cancelPlacement when the mouse is clicked outside the grid', () => {
        component.onClickOut(new MouseEvent('click'));
        expect(mousePlacementServiceSpy.cancelPlacement).toHaveBeenCalled();
    });

    it('onClickOut should call nothing if we clicked inside the grid', () => {
        spyOn(component['gridCanvas'].nativeElement, 'contains').and.returnValue(true);
        component.onClickOut(new MouseEvent('click'));
        expect(mousePlacementServiceSpy.cancelPlacement).not.toHaveBeenCalled();
    });

    it('onMouseClick should call cancelPlacement if the game is ended', () => {
        stubGame.hasEnded = true;
        gameServiceSpy.game$.next(stubGame);
        component.onMouseClick(new MouseEvent('click'));
        expect(mousePlacementServiceSpy.cancelPlacement).toHaveBeenCalled();
    });

    it('onMouseClick should call setMarker if we click with MouseButton.Left', () => {
        stubGame.hasEnded = false;
        gameServiceSpy.game$.next(stubGame);
        component.onMouseClick(new MouseEvent('click', { button: 0 }));
        expect(mousePlacementServiceSpy.setMarker).toHaveBeenCalled();
    });

    it('onMouseClick should call nothing if we click with other than MouseButton.Left', () => {
        stubGame.hasEnded = false;
        gameServiceSpy.game$.next(stubGame);
        component.onMouseClick(new MouseEvent('click', { button: 1 }));
        expect(mousePlacementServiceSpy.setMarker).not.toHaveBeenCalled();
        expect(mousePlacementServiceSpy.cancelPlacement).not.toHaveBeenCalled();
    });
});
