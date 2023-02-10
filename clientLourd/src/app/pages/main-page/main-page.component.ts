import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AboutUsComponent } from '@app/components/about-us/about-us.component';
import { HighscoresComponent } from '@app/components/highscores/highscores.component';
import { ParametersComponent } from '@app/components/parameters/parameters.component';
import { GameMode } from '@common/game-mode';
import { AuthentificationService} from '@app/services/authentification/authentification.service';
import { LoginComponent } from '@app/components/login-component/login.component';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'Scrabble';
    isJoining: boolean = false;

    constructor(public dialog: MatDialog, public authentificationService: AuthentificationService) {}
    openParameterDialog(mode: string): void {
        const gameMode: GameMode = mode === GameMode.Classic ? GameMode.Classic : GameMode.Log2990;
        this.dialog.open(ParametersComponent, {
            panelClass: 'parametrisationModal',
            disableClose: true,
            data: { gameMode },
        });
    }
    openScoreDialog(): void {
        this.dialog.open(HighscoresComponent, { panelClass: 'parametrisationModal' });
    }
    openAboutUsDialog(): void {
        this.dialog.open(AboutUsComponent, { panelClass: 'parametrisationModal' });
    }
    openLoginDialog(): void {
        this.dialog.open(LoginComponent, { panelClass: 'parametrisationModal' });
    }

    isConnected(): Boolean {
        if (this.authentificationService.getIsConnected) {
            this.dialog.closeAll();
        }
        return this.authentificationService.getIsConnected;
    }

    logout(): void{
        this.authentificationService.logout();
    }
}
