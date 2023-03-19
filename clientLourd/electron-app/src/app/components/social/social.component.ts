import { Component } from "@angular/core";
import { UserService } from "@app/services/user/user.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";

@Component({
    selector: "app-social",
    templateUrl: "./social.component.html",
    styleUrls: ["./social.component.scss"],
})
export class SocialComponent {
  activeScreen = "En ligne";
  screens = ["En ligne", "Tous", "En attente", "Ajouter un ami"];
  onlineFriendUserNameSearch = ""
  addFriendUserName = "";

  constructor(private userService: UserService, private websocketService: WebSocketService) {}

  /*filterOnlineFriends(): string[] {
    return this.userService.currentUserValue.
  }*/

  sendFriendRequest(): void {

    //this.websocketService.send()
  }

  selectNavButton(index: number): void {
    this.activeScreen = this.screens[index];
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