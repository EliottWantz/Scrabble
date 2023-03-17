import { Component, ElementRef, Inject, OnInit, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { CommunicationService } from "@app/services/communication/communication.service";

@Component({
    selector: "app-default-avatar-selection",
    templateUrl: "./default-avatar-selection.component.html",
    styleUrls: ["./default-avatar-selection.component.scss"],
})
export class DefaultAvatarSelectionComponent implements OnInit {
    defaultAvatars: {url: string, fileId: string}[] = [];
    constructor(public dialogRef: MatDialogRef<DefaultAvatarSelectionComponent>, private commService: CommunicationService) {
    }

    ngOnInit(): void {
        this.commService.getDefaultAvatars().then((res) => {
            this.defaultAvatars = res.avatars;
        });
    }

    save() {
        this.dialogRef.close();
    }

    close() {
        this.dialogRef.close();
    }
}