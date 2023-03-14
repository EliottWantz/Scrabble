import { Component, OnInit } from "@angular/core";
import { CommunicationService } from "@app/services/communication/communication.service";
import { UserService } from "@app/services/user/user.service";
import { User } from "@app/utils/interfaces/user";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "app-profile-page",
  templateUrl: "./profile-page.component.html",
  styleUrls: ["./profile-page.component.scss"],
})
export class ProfilePageComponent implements OnInit {
  username = "";
  email = "";
  selectedFile: File = new File([], "");
  hasError = false;
  user!: BehaviorSubject<User>;
  constructor(private communicationService: CommunicationService, private userService: UserService) {
    this.user = this.userService.subjectUser;
  }

  ngOnInit() {
    this.user.subscribe();
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null;
  }

  async submit(): Promise<void> {
    if (this.selectedFile.name != "") {
      await this.communicationService.uploadAvatar(this.selectedFile, this.userService.currentUserValue).then((res) => {
        this.userService.subjectUser.next({...this.userService.subjectUser.value, avatar: res})
        document.getElementById("avatar")?.setAttribute("src", res.url);
      });
    }
    
  }

  getDate(time: number) {
    return new Date(time).toLocaleString()
  }
}
