import { Injectable } from "@angular/core";
import { Room } from "@app/utils/interfaces/room";
import { BehaviorSubject } from "rxjs";
import { CommunicationService } from "@app/services/communication/communication.service"
import { UserService } from "@app/services/user/user.service";
import { ChatMessage } from "@app/utils/interfaces/chat-message";

@Injectable({
    providedIn: 'root',
})
export class RoomService {
    rooms!: BehaviorSubject<BehaviorSubject<Room>[]>;
    currentRoom!: BehaviorSubject<Room>;

    constructor(private commService: CommunicationService, private userService: UserService) {
        this.rooms = new BehaviorSubject<BehaviorSubject<Room>[]>([]);
        this.currentRoom = new BehaviorSubject<Room>({
            roomId: "",
            users: [],
            messages: []
        });
    }

    async joinRoom(roomId: string, roomName: string): Promise<void> {
        await this.commService.joinRoom(this.userService.currentUserValue.id, roomId, roomName).then((res) => {
            this.addRoom(res.room);
        })
        .catch((err) => {
            console.log(err);
        });
    }

    addRoom(room: Room): void {
        const newRoom = new BehaviorSubject<Room>(room);
        this.rooms.next([...this.rooms.value, newRoom]);
        this.currentRoom.next(newRoom.value);
    }

    removeRoom(roomID: string): void {
        const currentRooms = this.rooms.getValue();
        const index = this.findRoom(roomID);
        if (index)
            currentRooms.splice(index, 1);

        this.rooms.next(currentRooms);
    }

    changeRoom(roomId: string): void {
        const index = this.findRoom(roomId);
        if (index)
            this.currentRoom.next(this.rooms.value[index].value);
    }

    addMessage(msg: ChatMessage): void {
        const index = this.findRoom(msg.roomId);
        if (index) {
            if (this.rooms.value[index].value.roomId == this.currentRoom.value.roomId) {
                this.currentRoom.next({...this.rooms.value[index].value, messages: [...this.rooms.value[index].value.messages, msg]});
            } else {
                this.rooms.value[index].next({...this.rooms.value[index].value, messages: [...this.rooms.value[index].value.messages, msg]});
            }
        }
    }

    findRoom(roomIdTocHeck: string): number | undefined {
        for (let i = 0; i < this.rooms.value.length; i++) {
            if (this.rooms.value[i].value.roomId == roomIdTocHeck)
                return i;
        }
        return undefined;
    }
}