import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Packet } from "@app/utils/interfaces/packet";
import { Room } from "@app/utils/interfaces/room";
import { ChatMessage } from "@app/utils/interfaces/chat-message";
import { UserService } from "@app/services/user/user.service";
import { WebSocketService } from "@app/services/web-socket/web-socket.service";
import { User } from "@app/utils/interfaces/user";
import { RoomService } from "@app/services/room/room.service";

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    globalRoomId!: string;
    user: BehaviorSubject<User>;

    constructor(private userService: UserService, private roomService: RoomService, private socketService: WebSocketService) {
        this.user = this.userService.subjectUser;
    }

    send(msg: string, room: Room): void {
        if (this.userService.isLoggedIn && this.roomService.findRoom(room.roomId) !== undefined) {
            const payload: ChatMessage = {
                roomId: room.roomId,
                from: this.user.value.username,
                fromId: this.user.value.id,
                message: msg
            };
            const packet: Packet = {
                event: "chat-message",
                payload: payload,
            };
            this.socketService.send("chat-message", payload);
        } else {
            console.log("Not logged in");
        }
    }
}