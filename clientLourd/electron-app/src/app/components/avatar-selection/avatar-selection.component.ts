import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { AuthenticationService } from "@app/services/authentication/authentication.service";
import { Router } from "@angular/router"
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { DefaultAvatarSelectionComponent } from "@app/components/default-avatar-selection/default-avatar-selection.component";
import { BehaviorSubject } from "rxjs";

@Component({
    selector: "app-avatar-selection",
    templateUrl: "./avatar-selection.component.html",
    styleUrls: ["./avatar-selection.component.scss"],
})
export class AvatarSelectionComponent {
    selectedFile: any = null;
    isRegisterFailed = false;
    errorImage = false;
    imagePreview = "";
    errorImageType = false;

    constructor(public dialog: MatDialog, private authService: AuthenticationService, private router: Router) {
        const formData = this.authService.tempUserLogin.value;
        this.authService.tempUserLogin.next(formData);

        this.authService.tempUserLogin.subscribe(() => {
            this.errorImage = false;
            const customAvatar = this.authService.tempUserLogin.value.get("avatar");
            const defaultAvatar = this.authService.tempUserLogin.value.get("avatarUrl");
            if (customAvatar) {
                this.setImagePreview(customAvatar);
            } else if (defaultAvatar) {
                this.setImagePreview(defaultAvatar);
            }
        });
    }

    onFileSelected(event: any): void {
        this.selectedFile = event.target.files[0] ?? null;
        if (this.selectedFile) {
            const formData = this.authService.tempUserLogin.value;
            if (formData.has("avatarUrl"))
                formData.delete("avatarUrl");
            if (formData.has("fileId"))
                formData.delete("fileId");

            if (this.selectedFile['type'] != "image/png" && this.selectedFile['type'] != "image/jpeg" && this.selectedFile['type'] != "image/jpg") {
                console.log("wrong type");
                this.errorImageType = true;
                this.errorImage = false;
                this.selectedFile = null;
                this.authService.tempUserLogin.next(formData);
            } else {
                this.errorImageType = false;
                formData.set("avatar", this.selectedFile);
                this.authService.tempUserLogin.next(formData);
            }
        }
    }

    openDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        this.dialog.open(DefaultAvatarSelectionComponent, {width: '75%',
        minHeight: '50vh',
        height : '50vh'});
    }

    /*checkIfImage(): boolean {
        if (!(this.currentImageChosen.value instanceof FormData) && this.currentImageChosen.value.url == "") {
            return false;
        } else {
            return true;

        }
    }*/

    setImagePreview(avatar: FormDataEntryValue): void {
        if (avatar instanceof File) {
            if (this.selectedFile) {
                const reader = new FileReader();

                reader.onload = (e: any) => {
                    this.imagePreview = e.target.result;
                };
                reader.readAsDataURL(this.selectedFile);
            }
        } else {
            this.imagePreview = avatar;
        }
    }

    async submit(): Promise<void> {
        const avatar = this.authService.tempUserLogin.value.get("avatar");
        const avatarUrl = this.authService.tempUserLogin.value.get("avatarUrl");
        if (!avatar && !avatarUrl) {
            this.errorImage = true;
            return;
        } else if (avatarUrl && avatarUrl == "") {
            this.errorImage = true;
            return;
        }
        this.errorImageType = false;
        this.errorImage = false;
        const isLoggedIn = await this.authService.register();
        if (isLoggedIn) {
            this.errorImage = false;
            this.router.navigate(['/home']);
        } else {
            this.router.navigate(['/register']);
        }
    }
}