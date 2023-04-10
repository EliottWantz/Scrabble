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
  screen = "Modifier mon profil";
  screens = ["Modifier mon profil", "Historique", "Activité"];
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

  isLoggedIn(): boolean {
    return this.userService.isLoggedIn;
  }

  getDate(time: number) {
    return new Date(time).toLocaleDateString();
  }

  getTime(time: number) {
    return new Date(time).toLocaleTimeString();
  }

  getWonOrLost(gameWon: boolean): string {
    return gameWon ? "Partie gagné" : "Partie perdu";
  } 

  selectNavButton(index: number): void {
    this.screen = this.screens[index];
    const navButtons = document.getElementsByClassName('nav-text');
    for (let i = 0; i < navButtons.length; i++) {
      if (i != index) {
        navButtons[i].setAttribute("style", "");
      } else {
        navButtons[i].setAttribute("style", "background-color: #424260; outline-color: #66678e; outline-width: 1px; outline-style: solid;");
      }
    }
  }
}
