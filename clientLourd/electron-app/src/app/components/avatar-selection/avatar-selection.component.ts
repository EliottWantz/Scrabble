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
    currentImageChosen: BehaviorSubject<{url: string, fileId: string} | FormData>;
    isRegisterFailed = false;
    errorImage = false;
    imagePreview: BehaviorSubject<string> = new BehaviorSubject<string>("");

    constructor(public dialog: MatDialog, private authService: AuthenticationService, private router: Router) {
        this.authService.tempUserLogin.avatar.next({url: "", fileId: ""})
        this.currentImageChosen = this.authService.tempUserLogin.avatar;
        this.currentImageChosen.subscribe(() => {
            if (!(this.currentImageChosen.value instanceof FormData))
                this.selectedFile = null;

            this.setImagePreview();
        });
    }

    onFileSelected(event: any): void {
        this.selectedFile = event.target.files[0] ?? null;
        if (this.selectedFile) {
            const formData = new FormData();
            formData.append("avatar", this.selectedFile);
            this.authService.tempUserLogin.avatar.next(formData);
        }
    }

    openDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        this.dialog.open(DefaultAvatarSelectionComponent, {width: '75%',
        minHeight: '50vh',
        height : '50vh'});
    }

    checkIfImage(): boolean {
        if (!(this.currentImageChosen.value instanceof FormData) && this.currentImageChosen.value.url == "") {
            return false;
        } else {
            return true;

        }
    }

    setImagePreview(): void {
        if (this.currentImageChosen.value instanceof FormData) {
            if (this.selectedFile) {
                const reader = new FileReader();

                reader.onload = (e: any) => {
                    this.imagePreview.next(e.target.result);
                };
                reader.readAsDataURL(this.selectedFile);
            }
        } else {
            this.imagePreview.next(this.currentImageChosen.value.url);
        }
    }

    async submit(): Promise<void> {
        if (!(this.authService.tempUserLogin.avatar.value instanceof FormData)) {
            if (this.authService.tempUserLogin.avatar.value.url == "") {
                this.errorImage = true;
                return;
            }
        }
        const isLoggedIn = await this.authService.register(this.authService.tempUserLogin.username, this.authService.tempUserLogin.password, this.authService.tempUserLogin.email, this.authService.tempUserLogin.avatar.value);
        if (isLoggedIn) {
            this.errorImage = false;
            this.router.navigate(['/home']);
        } else {
            this.router.navigate(['/register']);
        }
    }
}