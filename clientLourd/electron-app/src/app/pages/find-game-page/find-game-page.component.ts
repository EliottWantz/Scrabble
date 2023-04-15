import { Component } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { CreateGameComponent } from "@app/components/create-game/create-game.component";
import { CreateTournamentComponent } from "@app/components/create-tournament/create-tournament.component";
import { JoinGameComponent } from "@app/components/join-game/join-game.component";
import { JoinTournamentComponent } from "@app/components/join-tournament/join-tournament.component";
@Component({
    selector: "app-find-game-page",
    templateUrl: "./find-game-page.component.html",
    styleUrls: ["./find-game-page.component.scss"],
})
export class FindGamePageComponent {

    constructor(public dialog: MatDialog) {}

    openDialogJoinGame(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        this.dialog.open(JoinGameComponent, {width: '80%',
        minHeight: '70vh',
        height : '50vh',
        data: {isObserver: false}});
    }

    openDialogJoinTournament(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        this.dialog.open(JoinTournamentComponent, {width: '80%',
        minHeight: '70vh',
        height : '50vh',
        data: {isObserver: false}});
    }

    openDialogCreateGame(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        this.dialog.open(CreateGameComponent, {});
    }

    openDialogCreateTournament(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        this.dialog.open(CreateTournamentComponent, {});
    }

    openDialogJoinAsObserver(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        this.dialog.open(JoinGameComponent, {width: '80%',
        minHeight: '70vh',
        height : '50vh',
        data: {isObserver: true}});
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