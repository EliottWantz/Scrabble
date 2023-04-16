import { Component, Inject } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Game } from "@app/utils/interfaces/game/game";
import { Router } from "@angular/router";

@Component({
    selector: "app-game-over",
    templateUrl: "./game-over.component.html",
    styleUrls: ["./game-over.component.scss"],
})
export class GameOverComponent {
    games: Game[] = [];
    constructor(public dialogRef: MatDialogRef<GameOverComponent>, public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: {isWinner: boolean, isObserving: boolean},
        private router: Router) {
        
    }

    close() {
        this.router.navigate(["/home"]);
        this.dialogRef.close();
    }
}