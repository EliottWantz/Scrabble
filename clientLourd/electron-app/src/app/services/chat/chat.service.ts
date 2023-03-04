import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ChatMessage } from "@app/utils/interfaces/chat-message";
import { Packet } from "@app/utils/interfaces/packet";
@Injectable({
    providedIn: 'root',
})
export class ChatService {
    messages$: BehaviorSubject<ChatMessage[]>;
    constructor(private webSocketService: WebSocket) {
        this.messages$ = new BehaviorSubject<ChatMessage[]>([]);
    }
}