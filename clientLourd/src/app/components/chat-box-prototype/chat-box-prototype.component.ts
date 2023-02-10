import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, ViewChild, OnInit } from '@angular/core';
import { FormGroup, AbstractControl, Validators, FormBuilder} from '@angular/forms';
import { MessageErrorStateMatcher } from '@app/classes/form-error/error-state-form';
import { ChatMessage, User } from './Exports';
import { Packet, JoinedGlobalRoomPayload, BroadcastPayload } from './Exports';
import { AuthentificationService } from '@app/services/authentification/authentification.service';

@Component({
    selector: 'app-chat-box-prototype',
    templateUrl: './chat-box-prototype.component.html',
    styleUrls: ['./chat-box-prototype.component.scss'],
})
export class ChatBoxPrototypeComponent implements OnInit {
    @ViewChild('chatBoxMessages') chatBoxMessagesContainer: CdkVirtualScrollViewport;
    chatBoxForm: FormGroup;
    messages: ChatMessage[]
    messageValidator: MessageErrorStateMatcher;
    globalRoomId:string;
    ws:WebSocket;
    user:User;
    
    constructor(private authentificationService: AuthentificationService, private fb: FormBuilder,){       
        this.chatBoxForm = this.fb.group({
            input: ['', [Validators.required]],
        });
    }

    ngOnInit(): void {
        this.connect()
    }

    async connect(): Promise<void>{
        this.messages = [];
        this.user = this.authentificationService.currentUserValue;
        this.ws = new WebSocket('wss://scrabble-production.up.railway.app/ws?id=' + this.user.id);
        this.ws.onmessage = (e) => {
            const packet: Packet = JSON.parse(e.data);
            switch (packet.event) {
                case "joinedGlobalRoom":
                  this.globalRoomId = ((packet.payload as JoinedGlobalRoomPayload).roomId);
                  break;
                case "broadcast": {
                  const payload = packet.payload as BroadcastPayload;
                  console.log(payload)
                  const message: ChatMessage = {
                    from: payload.from,
                    message: payload.message,
                    timestamp: new Date(payload.timestamp!).toLocaleTimeString(
                      undefined, { hour12: false }
                    )
                  };
                  console.log(this.messages)
                  this.messages.push(message);
                }
              }
        }
        this.chatBoxForm.reset()
    }
    async send(msg:string): Promise<void> {
        if (!msg) return;
            console.log("Sending message: " + msg);
            const payload: BroadcastPayload = {
                roomId: this.globalRoomId,
                from: this.user.username,
                message: msg,
            };
        const packet: Packet = {
        event: "broadcast",
            payload: payload,
        };
        this.ws.send(JSON.stringify(packet));
        msg = "";
        this.chatBoxForm.reset();
        this.scrollBottom();
    }

    get input(): AbstractControl {
        return this.chatBoxForm.controls.input;
    }

     private scrollBottom(): void {
         this.chatBoxMessagesContainer.elementRef.nativeElement.scrollTop = this.chatBoxMessagesContainer.elementRef.nativeElement.scrollHeight;
    }
}
