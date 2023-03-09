import { Injectable } from "@angular/core";
import { UserService } from "@app/services/user/user.service";
import { User } from "@app/utils/interfaces/user";
import { BehaviorSubject } from "rxjs";
import { environment } from 'src/environments/environment';
import { ClientPayload, CreateRoomPayload, JoinDMPayload, JoinRoomPayload, LeaveRoomPayload, Packet, PlayMovePayload } from "@app/utils/interfaces/packet";
import { RoomService } from "@app/services/room/room.service";
import { Room } from "@app/utils/interfaces/room";
import { ChatMessage } from "@app/utils/interfaces/chat-message";
import { ClientEvent } from "@app/utils/events/client-events";
import { ServerEvent } from "@app/utils/events/server-events";

@Injectable({
    providedIn: "root",
})
export class WebSocketService {
    socket!: WebSocket;
    user: BehaviorSubject<User>;

    constructor(private userService: UserService, private roomService: RoomService) {
        this.user = this.userService.subjectUser;
    }

    async connect(): Promise<void> {
        if (this.user) {
            this.socket = new WebSocket(
                `${environment.wsUrl}/?id=${this.user.value.id}&username=${this.user.value.username}`
            );
            this.socket.onopen = () => {
                this.socket.onmessage = (e) => {
                    this.handleSocket(e);
                }
            }  
        }
    }

    disconnect(): void {
        this.socket.close();
        this.userService.deleteUser();
    }

    private async handleSocket(e: MessageEvent): Promise<void> {
        const packet: Packet = JSON.parse(e.data);
        if (packet.event as ServerEvent) {
            switch (packet.event) {
                case "joinedRoom":
                    const payloadRoom = packet.payload as Room;
                    if (this.roomService.findRoom(payloadRoom.roomId) === undefined) {
                        this.roomService.addRoom(payloadRoom);
                    }
                    break;
    
                case "chat-message":
                    const payloadMessage = packet.payload as ChatMessage;
                    const message: ChatMessage = {
                        from: payloadMessage.from,
                        fromId: payloadMessage.fromId,
                        roomId: payloadMessage.roomId,
                        message: payloadMessage.message,
                        timestamp: new Date(payloadMessage.timestamp!).toLocaleTimeString(
                          undefined,
                          { hour12: false }
                        ),
                    };
                    this.roomService.addMessage(message);
                    break;
    
                case "listUsers":
                    break;
            }
        }
    }

    send(event: ClientEvent, payload: ClientPayload): void {
        const packet: Packet = {
            event: event,
            payload: payload,
        };
        this.socket.send(JSON.stringify(packet));
    }
}