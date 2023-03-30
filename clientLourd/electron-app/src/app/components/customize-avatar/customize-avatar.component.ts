import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { GameService } from "@app/services/game/game.service";
import { StorageService } from "@app/services/storage/storage.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { ClientEvent } from "@app/utils/events/client-events";
import { Game } from "@app/utils/interfaces/game/game";
import { JoinGamePayload } from "@app/utils/interfaces/packet";
import { BehaviorSubject } from "rxjs";

@Component({
    selector: "app-customize-avatar",
    templateUrl: "./customize-avatar.component.html",
    styleUrls: ["./customize-avatar.component.scss"],
})
export class CustomizeAvatarComponent {
    firstFormGroup = this.formBuilder.group({
        firstCtrl: ['', Validators.required],
      });
    constructor(public dialogRef: MatDialogRef<CustomizeAvatarComponent>, private formBuilder: FormBuilder) {
    }

    submit(): void {
        /*if (this.selectedAvatar.fileId == "") {
            this.error = true;
            return;
        }
        const formData = this.authService.tempUserLogin.value;
        if (formData.has("avatar"))
            formData.delete("avatar");
        formData.set("avatarUrl", this.selectedAvatar.url);
        formData.set("fileId", this.selectedAvatar.fileId);
        this.authService.tempUserLogin.next(formData);
        this.dialogRef.close();*/
    }

    close() {
        this.dialogRef.close();
    }
}