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
import { AuthenticationService } from "@app/services/authentication/authentication.service";
import { BehaviorSubject } from "rxjs";
import {
  BroadcastPayload,
  ChatMessage,
  JoinedGlobalRoomPayload,
  Packet,
  User,
} from "./Exports";

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
  globalRoomId!: string;
  ws!: WebSocket;
  user!: User;
  @ViewChild("chatBoxInput")
  chatBoxInput!: ElementRef;

  constructor(
    private authenticationService: AuthenticationService,
    private fb: FormBuilder
  ) {
    this.chatBoxForm = this.fb.group({
      input: ["", [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.connect();
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

  async connect(): Promise<void> {
    // this.messages = [];
    this.messages$ = new BehaviorSubject<ChatMessage[]>([]);
    this.user = this.authenticationService.currentUserValue;
    this.ws = new WebSocket(
      "wss://scrabble-production.up.railway.app/ws?id=" + this.user.id
    );
    this.ws.onmessage = (e) => {
      const packet: Packet = JSON.parse(e.data);
      switch (packet.event) {
        case "joinedGlobalRoom":
          this.globalRoomId = (
            packet.payload as JoinedGlobalRoomPayload
          ).roomId;
          break;
        case "broadcast": {
          const payload = packet.payload as BroadcastPayload;
          console.log(payload);
          const message: ChatMessage = {
            from: payload.from,
            message: payload.message,
            timestamp: new Date(payload.timestamp!).toLocaleTimeString(
              undefined,
              { hour12: false }
            ),
          };
          // console.log(this.messages$.value);
          this.messages$.next([...this.messages$.value, message]);
          this.scrollBottom();
          setTimeout(() => {
            this.scrollBottom();
          });
        }
      }
    };
    this.chatBoxForm.reset();
  }
  async send(msg: string): Promise<void> {
    if (!msg || !msg.replace(/\s/g, '')) return;
    // console.log("Sending message: " + msg);
    const payload: BroadcastPayload = {
      roomId: this.globalRoomId,
      from: this.user.username,
      message: msg,
    };
    console.log(this.user);
    const packet: Packet = {
      event: "broadcast",
      payload: payload,
    };
    this.ws.send(JSON.stringify(packet));
    // msg = "";
    // this.chatBoxForm.setValue({ input: "" });
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



  public popout(): void {
    
  }
}
