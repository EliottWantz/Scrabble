import { Component, ElementRef, Inject, OnInit, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AuthenticationService } from "@app/services/authentication/authentication.service";
import { CommunicationService } from "@app/services/communication/communication.service";

@Component({
    selector: "app-default-avatar-selection",
    templateUrl: "./default-avatar-selection.component.html",
    styleUrls: ["./default-avatar-selection.component.scss"],
})
export class DefaultAvatarSelectionComponent implements OnInit {
    defaultAvatars: {url: string, fileId: string}[] = [];
    selectedAvatar: {url: string, fileId: string};
    error = false;
    constructor(public dialogRef: MatDialogRef<DefaultAvatarSelectionComponent>, private commService: CommunicationService, private authService: AuthenticationService) {
        this.selectedAvatar = {url: "", fileId: ""};
    }

    select(index: number): void {
        if (this.defaultAvatars[index].fileId == "")
            return;
        this.selectedAvatar = this.defaultAvatars[index];
        for(let i = 0; i < document.getElementsByClassName("avatar").length; i++) {
            if (i != index) {
                document.getElementsByClassName("card")[i].setAttribute("style", "");
            } else {
                document.getElementsByClassName("card")[i].setAttribute("style", "box-shadow: 0 0 10px 10px #90c593;");
            }
        }
    }

    ngOnInit(): void {
        this.commService.getDefaultAvatars().then((res) => {
            this.defaultAvatars = res.avatars;
        });
    }

    save() {
        if (this.selectedAvatar.fileId == "") {
            this.error = true;
            return;
        }
        this.authService.tempUserLogin.avatar.next(this.selectedAvatar);
        this.dialogRef.close();
    }

    close() {
        this.dialogRef.close();
    }
}