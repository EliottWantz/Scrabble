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
  FormGroup,
  Validators,
} from "@angular/forms";
//import { MessageErrorStateMatcher } from "@app/classes/form-error/error-state-form";
import { ChatService } from "@app/services/chat/chat.service";
import { BehaviorSubject } from "rxjs";
import { User } from "@app/utils/interfaces/user";
import { RoomService } from "@app/services/room/room.service";
import { Room } from "@app/utils/interfaces/room";
import { UserService } from "@app/services/user/user.service";

@Component({
  selector: "app-chat-box",
  templateUrl: "./chat-box.component.html",
  styleUrls: ["./chat-box.component.scss"],
})
export class ChatBoxComponent implements OnInit, AfterViewInit {
  @ViewChild("chatBoxMessages")
  chatBoxMessagesContainer!: ElementRef;
  // @ViewChild("chatBoxMessages")
  // chatBoxMessagesContainer: CdkVirtualScrollViewport;
  chatBoxForm: FormGroup;
  //   messages: ChatMessage[];
  //messages$!: BehaviorSubject<ChatMessage[]>;
  room$!: BehaviorSubject<Room>;
  //messageValidator: MessageErrorStateMatcher = new MessageErrorStateMatcher;
  ws!: WebSocket;
  @ViewChild("chatBoxInput")
  chatBoxInput!: ElementRef;
  user!: User;

  constructor(
    private fb: FormBuilder,
    private chatService: ChatService,
    private roomService: RoomService,
    private userService: UserService
  ) {
    this.chatBoxForm = this.fb.group({
      input: ["", [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.room$ = this.roomService.currentRoom;
    this.user = this.userService.currentUserValue;
    this.room$.subscribe(() => {
      setTimeout(() => this.scrollBottom());
    });
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

  async send(msg: string): Promise<void> {
    if (!msg || !msg.replace(/\s/g, '')) return;

    await this.chatService.send(msg, this.roomService.currentRoom.value);
    this.chatBoxForm.reset();
    this.chatBoxInput.nativeElement.focus();
    //console.log(this.messages$);
  }

  get input(): AbstractControl {
    return this.chatBoxForm.controls["input"];
  }

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



  public popout(): void {
    
  }
}
