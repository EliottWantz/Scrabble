import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { CommunicationService } from "@app/services/communication/communication.service";
import { AuthenticationService } from "@app/services/authentication/authentication.service";
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
    gender = "";
    skinColors = ["#614335", "#ae5d29", "#d08b5b", "#edb98a", "#f8d25c", "#fd9841", "#ffdbb4"];
    selectedSkinColor = 0;
    hairType = "";
    hairTypes = ["straightAndStrand", "longButNotTooLong", "shortFlat", "fro", "dreads"];
    hairColor = "";
    accessoriesTypes = ["eyepatch", "sunglasses", "round", "none"];
    accessories = "";
    eyebrowsTypes = ["angry", "sadConcerned", "default", "unibrowNatural"];
    eyebrows = "";
    facialHairTypes = ["beardLight", "beardMajestic", "moustacheFancy", "moustacheMagnum", "none"];
    facialHair = "";
    eyeTypes = ["closed", "cry", "default", "hearts", "surprised"];
    eyes = "";
    facialHairColor = "";
    mouthTypes = ["default", "grimace", "sad", "smile", "screamOpen", "vomit"];
    mouth = "";
    backgroundColors = ["#b6e3f4", "#c0aede", "#d1d4f9", "#ffd5dc", "#ffdfbf"];
    selectedBackgroundColor = 0;
    firstFormGroup = this.formBuilder.group({
        firstCtrl: ['', Validators.required],
    });
    secondFormGroup = this.formBuilder.group({
        secondCtrl: ['', Validators.required],
    });
    thirdFormGroup = this.formBuilder.group({
        thirdCtrl: ['', Validators.required],
    });
    fourthFormGroup = this.formBuilder.group({
        fourthCtrl: ['', Validators.required],
    });
    fifthFormGroup = this.formBuilder.group({
        fifthCtrl: ['', Validators.required],
    });
    sixthFormGroup = this.formBuilder.group({
        sixthCtrl: ['', Validators.required],
    });
    seventhFormGroup = this.formBuilder.group({
        seventhCtrl: ['', Validators.required],
    });
    eightFormGroup = this.formBuilder.group({
        eightCtrl: ['', Validators.required],
    });
    ninthFormGroup = this.formBuilder.group({
        ninthCtrl: ['', Validators.required],
    });
    error = false;
    constructor(public dialogRef: MatDialogRef<CustomizeAvatarComponent>, private formBuilder: FormBuilder, private communicationService: CommunicationService, private authService: AuthenticationService) {
    }

    chooseSkinColor(index: number): void {
        this.selectedSkinColor = index;
    }

    chooseBackGroundColor(index: number): void {
        this.selectedBackgroundColor = index;
    }

    async submitAvatar(): Promise<void> {
        const res = this.communicationService.getCustomAvatar(this.gender, this.skinColors[this.selectedSkinColor], this.hairType, this.hairColor, this.accessories, this.eyebrows, this.facialHair, this.eyes, this.facialHairColor, this.mouth, this.backgroundColors[this.selectedBackgroundColor]).subscribe({
            error: (err) => {
                if (err.status == 200) {
                    this.error = false;
                    console.log(err);
                    const formData = this.authService.tempUserLogin.value;
                    if (formData.has("avatar"))
                        formData.delete("avatar");
                    if (formData.has("fileId"))
                        formData.delete("fileId");
                    formData.set("avatarUrl", err.url);
                    this.authService.tempUserLogin.next(formData);
                    this.dialogRef.close();
                } else {
                    this.error = true;
                }
            }
        })
    }

    close() {
        this.dialogRef.close();
    }
}