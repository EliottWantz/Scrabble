import { Component, ElementRef, ViewChild } from "@angular/core";
import { AuthenticationService } from "@app/services/authentication/authentication.service";
import { Router } from "@angular/router"
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { DefaultAvatarSelectionComponent } from "@app/components/default-avatar-selection/default-avatar-selection.component";

@Component({
    selector: "app-avatar-selection",
    templateUrl: "./avatar-selection.component.html",
    styleUrls: ["./avatar-selection.component.scss"],
})
export class AvatarSelectionComponent {
    selectedFile: any = null;

    constructor(public dialog: MatDialog) {}

    onFileSelected(event: any): void {
        this.selectedFile = event.target.files[0] ?? null;
    }

    openDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        this.dialog.open(DefaultAvatarSelectionComponent);
    }
}