import { Component } from "@angular/core";
import { CommunicationService } from "@app/services/communication/communication.service";
import { StorageService } from "@app/services/storage/storage.service";
import { UserService } from "@app/services/user/user.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { User } from "@app/utils/interfaces/user";
import { BehaviorSubject } from "rxjs";

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
  user: BehaviorSubject<User>;
  listUserDisplay: User[] = [];
  listUsers: User[] = [];
  usernameInput: any;

  constructor(private userService: UserService, private websocketService: WebSocketService, private communicationService: CommunicationService, private storageService: StorageService) {
    this.user = this.userService.subjectUser;
    for (const user of this.storageService.listUsers) {
      if (user.id != this.user.value.id)
        this.listUsers.push(user);
    }
    this.listUserDisplay = [...this.listUsers];
  }

  /*filterOnlineFriends(): string[] {
    return this.userService.currentUserValue.
  }*/

  sendFriendRequest(id: string): void {
    this.communicationService.sendFriendRequest(this.userService.currentUserValue.id, id);
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

  getUserAvatarUrl(id: string): string {
    const requestUser = this.storageService.getUserFromId(id);
    if (requestUser) {
      return requestUser.avatar.url;
    }
    return "";
  }

  getUserUsername(id: string): string {
    const requestUser = this.storageService.getUserFromId(id);
    if (requestUser) {
      return requestUser.username;
    }
    return "";
  }

  onSearchChange(input: string): void {
    this.listUserDisplay = this.listUsers.filter((user) => { return user.username.toLowerCase().includes(input.toLowerCase())});
  }

  acceptFriendRequest(id: string): void {return;}

  denyFriendRequest(id: string): void {return;}
}