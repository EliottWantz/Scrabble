import { Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { CommunicationService } from "@app/services/communication/communication.service";
import { RoomService } from "@app/services/room/room.service";
import { StorageService } from "@app/services/storage/storage.service";
// import { MessageErrorStateMatcher } from "@app/classes/form-error/error-state-form";
import { UserService } from "@app/services/user/user.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { ClientEvent } from "@app/utils/events/client-events";
import { JoinDMPayload } from "@app/utils/interfaces/packet";
import { Summary, UserStats } from "@app/utils/interfaces/summary";
import { User } from "@app/utils/interfaces/user";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "app-social-page",
  templateUrl: "./social-page.component.html",
  styleUrls: ["./social-page.component.scss"],
})
export class SocialPageComponent {
  public user: BehaviorSubject<User>;
  public inDM:boolean;
  addFriend = true;
  chatFriend = false;
  friendUsername = "";
  addFriendErrorMessage = "";
  // messageValidator: MessageErrorStateMatcher = new MessageErrorStateMatcher;
  // friendForm: FormGroup;
  // friendInput!: ElementRef;

  constructor(private fb: FormBuilder, private userService: UserService, private socketService: WebSocketService, private communicationService: CommunicationService, private storageService: StorageService,
    private roomService: RoomService) {
    this.user = this.userService.subjectUser;
    this.inDM = false;
    this.addFriendPage();
    //document.getElementById("avatar")?.setAttribute("src", this.user.value.avatar.url);
    // this.friendForm = this.fb.group({
    //     input: ["", [Validators.required]],
    //   });
  }

  addFriendPage(): void {
    this.chatFriend = false;
    this.addFriend = true;
    document.getElementById('add-friend')?.setAttribute("style", "background-color: #424260; outline-color: #66678e; outline-width: 1px; outline-style: solid;");
    const friends = document.getElementsByClassName('friend');
    for (let i = 0; i < friends.length; i++) {
      friends[i].setAttribute("style", "");
    }
  }

  chatFriendPage(index: number): void {
    this.addFriend = false;
    this.chatFriend = true;
    document.getElementById('add-friend')?.setAttribute("style", "");
    const friends = document.getElementsByClassName('friend');
    for (let i = 0; i < friends.length; i++) {
      if (i != index) {
        friends[i].setAttribute("style", "");
      } else {
        friends[i].setAttribute("style", "background-color: #424260; outline-color: #66678e; outline-width: 1px; outline-style: solid;");
      }
    }


    //this.roomService.currentRoomChat = this.roomService.listChatRooms this.user.value.friends[index];
  }

  async sendFriendRequest(): Promise<void> {
    const user: User | undefined = this.storageService.getUserFromName(this.friendUsername);
    if (user) {
      await this.communicationService.sendFriendRequest(this.user.value.id, user.id).then((res) => {
        console.log(res);
        console.log("allo")
        /*const newFriendsList = this.user.value.friends;
        newFriendsList.push(user.id);
        this.userService.subjectUser.next({...this.userService.subjectUser.value, friends: newFriendsList});*/
      })
      .catch((err) => {
        this.addFriendErrorMessage = err.message;
      });
    }
  }

  // async addFriend(friendName: string): Promise<void> {
  //   if (!friendName || !friendName.replace(/\s/g, '')) return;

  //   // await this.chatService.send(msg, this.roomService.currentRoom.value);
  //   this.friendForm.reset();
  //   this.friendInput.nativeElement.focus();
  //   //console.log(this.messages$);
  // }

  async console():Promise<void>{
    console.log(this.user.value);
  }

  async initFriend():Promise<void>{
    this.user.value.friends = [];
  }

  async addFriendTemp():Promise<void>{
    this.user.value.friends = ["bruh"];
  }

  async friendChat(friendId: string):Promise<void>{
    this.inDM=true;
    const friend = await this.communicationService.getFriendByID(this.user.value.id, friendId)
    const payload: JoinDMPayload = {
      username:this.user.value.username,
      toId: friend.friend.id,
      toUsername:friend.friend.username
    }
    const event : ClientEvent = "join-dm-room";
    this.socketService.send(event, payload);
  }
}
