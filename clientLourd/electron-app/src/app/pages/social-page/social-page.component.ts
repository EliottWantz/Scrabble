import { Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { NewDmRoomComponent } from "@app/components/new-dm-room/new-dm-room.component";
import { CommunicationService } from "@app/services/communication/communication.service";
import { RoomService } from "@app/services/room/room.service";
import { SocialService } from "@app/services/social/social.service";
import { StorageService } from "@app/services/storage/storage.service";
// import { MessageErrorStateMatcher } from "@app/classes/form-error/error-state-form";
import { UserService } from "@app/services/user/user.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { ClientEvent } from "@app/utils/events/client-events";
import { CreateDMRoomPayload } from "@app/utils/interfaces/packet";
import { Room } from "@app/utils/interfaces/room";
import { User } from "@app/utils/interfaces/user";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "app-social-page",
  templateUrl: "./social-page.component.html",
  styleUrls: ["./social-page.component.scss"],
})
export class SocialPageComponent {
  public user: BehaviorSubject<User>;
  public inDM: boolean;
  chatFriend = false;
  friendUsername = '';
  addFriendErrorMessage = '';
  allFriendUserNameSearch = "";

  constructor(private fb: FormBuilder, private userService: UserService, private socketService: WebSocketService, private communicationService: CommunicationService, public dialog: MatDialog,
    public roomService: RoomService, public socialService: SocialService) {
    this.user = this.userService.subjectUser;
    this.inDM = false;
  }

  chatFriendPage(index: number): void {
    this.chatFriend = true;
    document.getElementById('add-friend')?.setAttribute("style", "");
    const friends = document.getElementsByClassName('friends');
    for (let i = 0; i < friends.length; i++) {
      if (i != index) {
        friends[i].setAttribute("style", "");
      } else {
        friends[i].setAttribute("style", "background-color: #424260; outline-color: #66678e; outline-width: 1px; outline-style: solid;");
      }
    }

    for (const room of this.roomService.listJoinedChatRooms.value) {
      const usersInRoom = room.name.split("/");
      console.log(usersInRoom);
      if (usersInRoom[0] == this.user.value.username && usersInRoom[1] == this.getUsernameFriend(index) ||
        usersInRoom[0] == this.getUsernameFriend(index) && usersInRoom[1] == this.user.value.username) {
        this.roomService.currentRoomChat.next(room);
        return;
      }
    }

    const friend = this.socialService.friendsList$.value[index];
    if (friend) {
      this.friendUsername = friend.username;
      const payload: CreateDMRoomPayload = {
        username: this.user.value.username,
        toId: friend.id,
        toUsername: friend.username,
      };
      const event: ClientEvent = 'create-dm-room';
      this.socketService.send(event, payload);
    }
  }

  getUsernameFriend(index: number): string {
    return this.socialService.friendsList$.value[index].username;
  }

  onSearChangeFriend(input: string): void {
    this.socialService.friendsList$.value.filter((user) => { return user.username.toLowerCase().includes(input.toLowerCase()) })
  }

  userOnline(username: string): boolean {
    if (!this.socialService.onlineFriends$.value) {
      return false;
    }
    return this.socialService.onlineFriends$.value.some((user) => { return user.username == username });
  }

  createNewDmRoom() {
    const dialogRef = this.dialog.open(NewDmRoomComponent, {
      width: "40vw",
      height: "30vh",
      data: { username: this.userService.currentUserValue.username }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.roomService.changeRoom(result);
      }
    });
  }

  isLoggedIn(): boolean {
    return this.userService.isLoggedIn;
  }

  selectNavButton(index: number): void {
    this.chatFriend = false;
    this.socialService.activeScreen = this.socialService.screens[index];
    const friends = document.getElementsByClassName('friend');
    for (let i = 0; i < friends.length; i++) {
      friends[i].setAttribute("style", "");
    }
  }

  findRoomWithoutFriend(): Room[] {
    const salles = this.roomService.listJoinedChatRooms.value.filter((salle) => {
      const usersInRoom = salle.name.split("/");
      return usersInRoom[0] != this.user.value.username && usersInRoom[1] != this.user.value.username;
    });
    console.log(salles);
    return salles;
  }
}
