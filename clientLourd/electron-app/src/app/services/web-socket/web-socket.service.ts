import { Injectable } from "@angular/core";
import { UserService } from "@app/services/user/user.service";
import { User } from "@app/utils/interfaces/user";
import { BehaviorSubject } from "rxjs";
import { environment } from 'src/environments/environment';
import { Packet } from "@app/utils/interfaces/packet";
import { RoomService } from "@app/services/room/room.service";
import { Room } from "@app/utils/interfaces/room";

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
            console.log("yo");
            this.socket = new WebSocket(
                `${environment.wsUrl}/?id=${this.user.value.id}&username=${this.user.value.username}`
            );
            this.socket.onmessage = (e) => {
                console.log("yo2");
                this.handleSocket(e);
            }
        }
    }

    disconnect(): void {
        this.socket.close.bind(this.socket);
    }

    private handleSocket(e: MessageEvent): void {
        const packet: Packet = JSON.parse(e.data);
        switch (packet.event) {
            case "joinedRoom":
                const payload = packet.payload as Room;
                if (!this.roomService.rooms.value.includes(payload)) {
                    this.roomService.addRoom(payload);
                }
                this.roomService.currentRoom.next(payload);
                console.log(payload);
                break;
        }
    }

    sendMessage(packet: Packet): void {
        this.socket.send(JSON.stringify(packet));
    }
}