import { Component } from "@angular/core";
import { CommunicationService } from "@app/services/communication/communication.service";
import { AuthenticationService } from "@app/services/authentication/authentication.service";
import { User } from "@app/utils/interfaces/user";

@Component({
  selector: "app-profile-page",
  templateUrl: "./profile-page.component.html",
  styleUrls: ["./profile-page.component.scss"],
})
export class ProfilePageComponent {
  username: string = "";
  email: string = "";
  selectedFile: File = new File([], "");
  hasError = false;
  user: User;
  constructor(private communicationService: CommunicationService, private authService: AuthenticationService) {
    this.user= this.authService.currentUserValue;
    document.getElementById("avatar")?.setAttribute("src", this.user.avatar.url);
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null;
  }

  async submit(): Promise<void> {
    if (this.selectedFile.name != "") {
      await this.communicationService.uploadAvatar(this.selectedFile, this.authService.currentUserValue).then((res) => {
        this.authService.subjectUser.next({...this.authService.subjectUser.value, avatar: res})
        document.getElementById("avatar")?.setAttribute("src", res.url);
      });
    }
    
  }
}
