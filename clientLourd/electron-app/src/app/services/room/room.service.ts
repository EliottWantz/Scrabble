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
    rooms!: BehaviorSubject<Room[]>;
    currentRoom!: BehaviorSubject<Room>;

    constructor(private commService: CommunicationService, private userService: UserService) {
        this.rooms = new BehaviorSubject<Room[]>([]);
        this.currentRoom = new BehaviorSubject<Room>({
            ID: "",
            users: [],
            messages: [],
            creatorID : "",
            isGameRoom: false
        });
    }

    async joinRoom(roomId: string, roomName: string): Promise<void> {
    }

    addRoom(room: Room): void {
        console.log(room);
        this.rooms.next([...this.rooms.value, room]);
        this.currentRoom.next(room);
    }

    removeRoom(roomID: string): void {
        const currentRooms = this.rooms.getValue();
        const index = this.findRoom(roomID);
        if (index !== undefined)
            currentRooms.splice(index, 1);

        this.rooms.next(currentRooms);
    }

    changeRoom(roomId: string): void {
        const index = this.findRoom(roomId);
        if (index !== undefined)
            this.currentRoom.next(this.rooms.value[index]);
    }

    addMessage(msg: ChatMessage): void {
        const index = this.findRoom(msg.roomId);
        if (index !== undefined) {
            if (this.rooms.value[index].ID == this.currentRoom.value.ID) {
                const currentMessages = this.currentRoom.value.messages;
                currentMessages.push(msg);
                this.currentRoom.next({...this.rooms.value[index], messages: currentMessages});
            } else {
                const currentMessages = this.rooms.value[index].messages;
                currentMessages.push(msg);
                const newRooms = this.rooms.value;
                newRooms[index] = {...newRooms[index], messages: currentMessages};
                this.rooms.next(newRooms);
                //this.rooms.value[index].next({...this.rooms.value[index], messages: currentMessages});
            }
        }
    }

    findRoom(roomIdTocHeck: string): number | undefined {
        for (let i = 0; i < this.rooms.value.length; i++) {
            if (this.rooms.value[i].ID == roomIdTocHeck)
                return i;         
        }
        return undefined;
    }
}