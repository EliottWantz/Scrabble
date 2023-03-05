import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Packet } from "@app/utils/interfaces/packet";
import { Room } from "@app/utils/interfaces/room";
import { ChatMessage } from "@app/utils/interfaces/chat-message";
import { UserService } from "@app/services/user/user.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { CommunicationService } from "@app/services/communication/communication.service";
import { User } from "@app/utils/interfaces/user";
import { RoomService } from "@app/services/room/room.service";

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    messages$: BehaviorSubject<ChatMessage[]>;
    globalRoomId!: string;
    user: BehaviorSubject<User>;

    constructor(private webSocketService: WebSocketService, private userService: UserService, private communicationService: CommunicationService, private roomService: RoomService) {
        this.messages$ = new BehaviorSubject<ChatMessage[]>([]);
        this.user = this.userService.subjectUser;
        this.webSocketService.socket.onmessage = (e) => {
            this.handleMessage(e);
        }
    }

    private handleMessage(e: MessageEvent): void {
        const packet: Packet = JSON.parse(e.data);
        switch (packet.event) {
            case "broadcast":
                this.handleBroadcast(packet);
                break;
        }
    }

    private handleBroadcast(packet: Packet): void {
        const payload = packet.payload as ChatMessage;
        console.log(payload);
        const message: ChatMessage = {
            from: payload.from,
            fromID: payload.fromID,
            roomID: payload.roomID,
            message: payload.message,
            timestamp: new Date(payload.timestamp!).toLocaleTimeString(
              undefined,
              { hour12: false }
            ),
        };
          // console.log(this.messages$.value);
        this.messages$.next([...this.messages$.value, message]);
    }

    async joinRoom(roomId: string, roomName: string): Promise<void> {
        await this.communicationService.joinRoom(this.user.value.id, roomId, roomName).then((res) => {
            this.roomService.addRoom(res.room);
        })
        .catch((err) => {
            console.log(err);
        });
    }

    async send(msg: string, room: Room): Promise<void> {
        if (this.userService.isLoggedIn && this.roomService.rooms.value.includes(room)) {
            const payload: ChatMessage = {
                roomID: room.ID,
                from: this.user.value.username,
                fromID: this.user.value.id,
                message: msg
            };
            const packet: Packet = {
                event: "broadcast",
                payload: payload,
            };
            this.webSocketService.sendMessage(packet);
        } else {
            console.log("Not logged in");
        }
    }
}