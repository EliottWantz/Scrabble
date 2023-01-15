import { KeyValue } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { GameService } from '@app/services/game/game.service';
import { GameMode } from '@common/game-mode';
import { PlayerScore } from '@common/player-score';

export const SMALLEST = -1;

@Component({
    selector: 'app-highscores',
    templateUrl: './highscores.component.html',
    styleUrls: ['./highscores.component.scss'],
})
export class HighscoresComponent {
    @ViewChild('stepper') stepper: MatStepper;
    isClassicScoreChosen: boolean;
    classicScores: Map<number, string[]>;
    logScores: Map<number, string[]>;
    isServerAvailable: boolean;

    constructor(private matDialog: MatDialog, private gameService: GameService) {
        this.classicScores = new Map();
        this.logScores = new Map();
    }

    async changeMode(mode: boolean): Promise<void> {
        this.isClassicScoreChosen = mode;
        const scores = await this.gameService.fetchScores(this.isClassicScoreChosen ? GameMode.Classic : GameMode.Log2990);
        if (!scores) this.isServerAvailable = false;
        else {
            this.assignScores(scores);
            this.isServerAvailable = true;
        }
        this.stepper.next();
    }

    closeModal(): void {
        this.matDialog.closeAll();
    }

    sortDescending(old: KeyValue<number, string[]>, newKey: KeyValue<number, string[]>): number {
        if ((old.key as number) < (newKey.key as number)) {
            return 1;
        } else {
            return SMALLEST;
        }
    }

    private assignScores(playerScore: PlayerScore[]): void {
        const mode = this.isClassicScoreChosen ? this.classicScores : this.logScores;
        for (const player of playerScore) {
            let names = mode.get(player.score);
            if (!names) names = [player.name];
            else names.push(player.name);
            mode.set(player.score, names);
        }
    }
}
