import { Component } from "@angular/core";
import { CommunicationService } from "@app/services/communication/communication.service";
import { StorageService } from "@app/services/storage/storage.service";

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
  constructor(private communicationService: CommunicationService, private storageService: StorageService) {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null;
  }

  async submit(): Promise<void> {
    console.log(this.selectedFile);
    const user = this.storageService.getUser()!;
    if (this.selectedFile.name != "") {
      await this.communicationService.uploadAvatar(this.selectedFile, user).then((res) => {
        user.avatar = res.url;
        this.storageService.saveUser(user);
        document.getElementById("avatar")?.setAttribute("src", res.url);
        console.log(res);
      });
    }
    
  }
}
