import { Component } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { CreateGameComponent } from "@app/components/create-game/create-game.component";
import { JoinGameComponent } from "@app/components/join-game/join-game.component";
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
        this.dialog.open(JoinGameComponent, {width: '75%',
        minHeight: '70vh',
        height : '50vh'});
    }

    openDialogCreateGame(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        this.dialog.open(CreateGameComponent, {width: '75%',
        minHeight: '70vh',
        height : '50vh'});
    }
}