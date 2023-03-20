import { Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { CommunicationService } from "@app/services/communication/communication.service";
// import { MessageErrorStateMatcher } from "@app/classes/form-error/error-state-form";
import { UserService } from "@app/services/user/user.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { ClientEvent } from "@app/utils/events/client-events";
import { CreateDMRoomPayload } from "@app/utils/interfaces/packet";
import { User } from "@app/utils/interfaces/user";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "app-main-page",
  templateUrl: "./social-page.component.html",
  styleUrls: ["./social-page.component.scss"],
})
export class SocialPageComponent {
  public user: BehaviorSubject<User>;
  public inDM:boolean;
  // messageValidator: MessageErrorStateMatcher = new MessageErrorStateMatcher;
  // friendForm: FormGroup;
  // friendInput!: ElementRef;

  constructor(private fb: FormBuilder, private userService: UserService, private socketService: WebSocketService, private communicationService: CommunicationService) {
    this.user = this.userService.subjectUser;
    this.inDM = false;
    //document.getElementById("avatar")?.setAttribute("src", this.user.value.avatar.url);
    // this.friendForm = this.fb.group({
    //     input: ["", [Validators.required]],
    //   });
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
    const payload: CreateDMRoomPayload = {
      username:this.user.value.username,
      toId: friend.friend.id,
      toUsername:friend.friend.username
    }
    const event : ClientEvent = "create-dm-room";
    this.socketService.send(event, payload);
  }
}
