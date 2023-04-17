import { Component } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { CreateGameComponent } from "@app/components/create-game/create-game.component";
import { CreateTournamentComponent } from "@app/components/create-tournament/create-tournament.component";
import { JoinGameComponent } from "@app/components/join-game/join-game.component";
import { JoinTournamentComponent } from "@app/components/join-tournament/join-tournament.component";
@Component({
    selector: "app-find-tournament-page",
    templateUrl: "./find-tournament-page.component.html",
    styleUrls: ["./find-tournament-page.component.scss"],
})
export class FindTournamentPageComponent {

    constructor(public dialog: MatDialog) {}

    openDialogJoinTournament(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        this.dialog.open(JoinTournamentComponent, {width: '80%',
        minHeight: '70vh',
        height : '50vh',
        data: {isObserver: false}});
    }

    openDialogCreateTournament(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        this.dialog.open(CreateTournamentComponent, {});
    }

    openDialogJoinTournamentAsObserver(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        this.dialog.open(JoinTournamentComponent, {width: '80%',
        minHeight: '70vh',
        height : '50vh',
        data: {isObserver: true}});
    }
}