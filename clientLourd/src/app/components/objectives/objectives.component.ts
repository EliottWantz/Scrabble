import { Component, OnInit } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { Game } from '@common/game';
import { GameMode } from '@common/game-mode';
import { Objective } from '@common/objectives';
import { Player } from '@common/player';

@Component({
    selector: 'app-objectives',
    templateUrl: './objectives.component.html',
    styleUrls: ['./objectives.component.scss'],
})
export class ObjectivesComponent implements OnInit {
    player: Player;
    opponent: Player;
    publicObjectives: Objective[];
    game: Game;

    constructor(public gameService: GameService, public playerService: PlayerService) {
        this.playerService.init();
    }

    ngOnInit(): void {
        this.gameService.game$.subscribe((game) => {
            this.game = game;
            if (game.mode === GameMode.Log2990) {
                this.publicObjectives = [] as Objective[];
                for (let i = 0; i < ((game.publicObjectives as Objective[]).length as number); i++) {
                    this.publicObjectives.push((game.publicObjectives as Objective[])[i]);
                }
            }
        });
        this.playerService.player$.subscribe((player) => (this.player = player));
        this.playerService.opponent$.subscribe((player) => (this.opponent = player));
    }
    isOpponentObjectivesCompleted(opp: Player) {
        return opp.privateObjective?.isCompleted;
    }
}
