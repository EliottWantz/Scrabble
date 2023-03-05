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
import { MessageErrorStateMatcher } from "@app/classes/form-error/error-state-form";
import { ChatService } from "@app/services/chat/chat.service";
import { BehaviorSubject, Subscription } from "rxjs";
import { ChatMessage } from "@app/utils/interfaces/chat-message";
import { User } from "@app/utils/interfaces/user";
import { RoomService } from "@app/services/room/room.service";

@Component({
  selector: "app-chat-box-prototype",
  templateUrl: "./chat-box-prototype.component.html",
  styleUrls: ["./chat-box-prototype.component.scss"],
})
export class ChatBoxPrototypeComponent implements OnInit, AfterViewInit {
  @ViewChild("chatBoxMessages")
  chatBoxMessagesContainer!: ElementRef;
  // @ViewChild("chatBoxMessages")
  // chatBoxMessagesContainer: CdkVirtualScrollViewport;
  chatBoxForm: FormGroup;
  //   messages: ChatMessage[];
  messages$!: BehaviorSubject<ChatMessage[]>;
  messageValidator: MessageErrorStateMatcher = new MessageErrorStateMatcher;
  ws!: WebSocket;
  user!: User;
  @ViewChild("chatBoxInput")
  chatBoxInput!: ElementRef;
  messagesSub: Subscription;

  constructor(
    private fb: FormBuilder,
    private chatService: ChatService,
    private roomService: RoomService
  ) {
    this.chatBoxForm = this.fb.group({
      input: ["", [Validators.required]],
    });
    this.messagesSub = new Subscription();
  }

  ngOnInit(): void {
    this.messages$ = this.chatService.messages$;
    this.messagesSub = this.messages$.subscribe(() => {
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
      console.log(
        "scrollTop",
        this.chatBoxMessagesContainer.nativeElement.scrollTop
      );
      console.log(
        "scrollHeight",
        this.chatBoxMessagesContainer.nativeElement.scrollHeight
      );
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
    console.log(
      "scrollTop",
      this.chatBoxMessagesContainer.nativeElement.scrollTop
    );
    console.log(
      "scrollHeight",
      this.chatBoxMessagesContainer.nativeElement.scrollHeight
    );
    console.log(
      "clientHeight",
      this.chatBoxMessagesContainer.nativeElement.clientHeight
    );
    console.log(
      "scrollTop + clientHeight",
      this.chatBoxMessagesContainer.nativeElement.scrollTop +
        this.chatBoxMessagesContainer.nativeElement.clientHeight
    );
    // if (shouldScroll) {
    this.chatBoxMessagesContainer.nativeElement.scrollTop =
      this.chatBoxMessagesContainer.nativeElement.scrollHeight;
    // }
  }
}
