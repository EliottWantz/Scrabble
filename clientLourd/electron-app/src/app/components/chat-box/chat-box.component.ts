import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  NgForm,
  Validators,
} from "@angular/forms";
//import { MessageErrorStateMatcher } from "@app/classes/form-error/error-state-form";
import { ChatService } from "@app/services/chat/chat.service";
import { BehaviorSubject } from "rxjs";
import { User } from "@app/utils/interfaces/user";
import { RoomService } from "@app/services/room/room.service";
import { Room } from "@app/utils/interfaces/room";
import { UserService } from "@app/services/user/user.service";
import { StorageService } from "@app/services/storage/storage.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { ClientEvent } from "@app/utils/events/client-events";
import { LeaveRoomPayload } from "@app/utils/interfaces/packet";
import { MatSelectChange } from "@angular/material/select";

@Component({
  selector: "app-chat-box",
  templateUrl: "./chat-box.component.html",
  styleUrls: ["./chat-box.component.scss"],
})
export class ChatBoxComponent implements AfterViewInit {
  @ViewChild("chatBoxMessages")
  chatBoxMessagesContainer!: ElementRef;
  // @ViewChild("chatBoxMessages")
  // chatBoxMessagesContainer: CdkVirtualScrollViewport;
  //chatBoxForm: FormGroup;
  //   messages: ChatMessage[];
  //messages$!: BehaviorSubject<ChatMessage[]>;
  room$!: BehaviorSubject<Room>;
  //messageValidator: MessageErrorStateMatcher = new MessageErrorStateMatcher;
  ws!: WebSocket;
  @ViewChild("chatBoxInput")
  chatBoxInput!: ElementRef;
  @ViewChild("roomSelect") roomSelect!: ElementRef;
  user!: User;
  currentRoomId = "";
  message = "";
  roomsFormControl = new FormControl();

  constructor(
    private fb: FormBuilder,
    private chatService: ChatService,
    private roomService: RoomService,
    private userService: UserService,
    private storageService: StorageService,
    private socketService: WebSocketService
  ) {
    this.room$ = this.roomService.currentRoomChat;
    this.currentRoomId = this.room$.value.id;
    this.user = this.userService.currentUserValue;
    this.room$.subscribe(() => {
      this.currentRoomId = this.room$.value.id;
      //console.log(this.chatBoxForm);
      setTimeout(() => this.scrollBottom());
    });
    /*this.chatBoxForm = this.fb.group({
      input: ["", [Validators.required]],
    });*/
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.chatBoxInput.nativeElement.focus();
      // this.messages$.subscribe(() => {
      //   this.scrollBottom();
      // })
      this.chatBoxMessagesContainer.nativeElement.scrollTop =
        this.chatBoxMessagesContainer.nativeElement.scrollHeight;
        this.chatBoxMessagesContainer.nativeElement.scrollTop;
        this.chatBoxMessagesContainer.nativeElement.scrollHeight;

        
      // this.scrollBottom();
      // this.messages$.subscribe(() => {
      //   this.scrollBottom();
      // });
    });
  }

  send(): void {
    console.log(this.currentRoomId);
    console.log(document.getElementById("selectionElem"));
    if (!this.message || !this.message.replace(/\s/g, '')) return;

    this.chatService.send(this.message, this.roomService.currentRoomChat.value);
    //this.chatBoxForm.get('message')?.reset();
    this.message = "";
    //this.chatBoxInput.nativeElement.focus();
    //console.log(this.messages$);
  }

  /*get input(): AbstractControl {
    return this.chatBoxForm.controls["input"];
  }*/

  private scrollBottom(): void {
    // const shouldScroll =
    //   this.chatBoxMessagesContainer.nativeElement.scrollTop +
    //     this.chatBoxMessagesContainer.nativeElement.clientHeight !==
    //   this.chatBoxMessagesContainer.nativeElement.scrollHeight;
    
    // console.log(shouldScroll);
    this.chatBoxMessagesContainer.nativeElement.scrollTop
    this.chatBoxMessagesContainer.nativeElement.scrollHeight
    this.chatBoxMessagesContainer.nativeElement.clientHeight
    this.chatBoxMessagesContainer.nativeElement.scrollTop + this.chatBoxMessagesContainer.nativeElement.clientHeight
    // if (shouldScroll) {
    this.chatBoxMessagesContainer.nativeElement.scrollTop =
      this.chatBoxMessagesContainer.nativeElement.scrollHeight;
    // }
  }

  getAvatarMessage(id: string): string {
    const avatar = this.storageService.getAvatar(id);
    if (avatar) return avatar;
    return "";
  }

  getRooms(): Room[] {
    return this.roomService.listJoinedChatRooms.value;
  }

  getRoomName(id: string): string {
    if (id == "global") return "Global Room";
    for (const room of this.roomService.listChatRooms.value) {
      if (room.id === id) return room.name;
    }
    return "";
  }

  changeRoom(event: MatSelectChange): void {
    console.log(this.getRoomName(this.currentRoomId));
    console.log(event.value.id);
    this.roomService.changeRoom(this.currentRoomId);
  }

  leaveRoom(index: number): void {
    const roomClicked = this.roomService.listJoinedChatRooms.value[index];
    const payload: LeaveRoomPayload = {
      roomId: roomClicked.id
    }
    let event: ClientEvent;
    if (roomClicked.name.includes(`${this.userService.currentUserValue.username}/`) || roomClicked.name.includes(`/${this.userService.currentUserValue.username}`)) {
      event = "leave-dm-room";
    } else {
      event = "leave-room";
    }
    this.roomService.currentRoomChat.next(this.roomService.listJoinedChatRooms.value[0]);
    console.log(this.roomService.currentRoomChat.value);
    this.socketService.send(event, payload);
    console.log(this.roomService.listJoinedChatRooms.value);
    //this.roomService.currentRoomChat.next(this.roomService.listJoinedChatRooms.value[0]);
    //this.roomService.changeRoom("global");
  }
}
