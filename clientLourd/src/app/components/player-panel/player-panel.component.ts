import { Component, Input } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
import { Player } from '@common/player';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-player-panel',
    templateUrl: './player-panel.component.html',
    styleUrls: ['./player-panel.component.scss'],
})
export class PlayerPanelComponent {
    @Input() player$: Observable<Player>;
    @Input() isOpponent: boolean;
    gameEnded: boolean;
    constructor(public gameService: GameService) {
        this.gameService.game$.subscribe((game) => {
            this.gameEnded = game.hasEnded;
        });
    }
}
