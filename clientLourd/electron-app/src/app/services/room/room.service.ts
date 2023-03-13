import { Injectable } from "@angular/core";
import { Room } from "@app/utils/interfaces/room";
import { BehaviorSubject } from "rxjs";
import { CommunicationService } from "@app/services/communication/communication.service"
import { UserService } from "@app/services/user/user.service";
import { ChatMessage } from "@app/utils/interfaces/chat-message";
import { User } from "@app/utils/interfaces/user";

@Injectable({
    providedIn: 'root',
})
export class RoomService {
    rooms!: BehaviorSubject<Room[]>;
    currentRoom!: BehaviorSubject<Room>;
    joinableGames!: BehaviorSubject<Room[]>;
    listChatRooms!: BehaviorSubject<Room[]>;

    constructor(private commService: CommunicationService, private userService: UserService) {
        this.rooms = new BehaviorSubject<Room[]>([]);
        this.currentRoom = new BehaviorSubject<Room>({
            id: "",
            userIds: [],
            messages: [],
            creatorId : "",
            isGameRoom: false
        });
        this.joinableGames = new BehaviorSubject<Room[]>([]);
        this.listChatRooms = new BehaviorSubject<Room[]>([]);
    }

    async joinRoom(roomId: string, roomName: string): Promise<void> {
    }

    addRoom(room: Room): void {
        //console.log(room);
        console.log("room");
        console.log(room);
        this.rooms.next([...this.rooms.value, room]);
        this.currentRoom.next(room);
    }

    addJoinableGame(room: Room): void {
        console.log(room);
        if (room.isGameRoom)
            this.joinableGames.next([...this.rooms.value, room]);
        console.log(this.joinableGames.value);
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
            if (this.rooms.value[index].id == this.currentRoom.value.id) {
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
            if (this.rooms.value[i].id == roomIdTocHeck)
                return i;         
        }
        return undefined;
    }

    findGame(roomIdTocHeck: string): number | undefined {
        for (let i = 0; i < this.joinableGames.value.length; i++) {
            if (this.joinableGames.value[i].id == roomIdTocHeck)
                return i;         
        }
        return undefined;
    }

    addUser(roomId: string, user: User): void {
        const rooms = this.rooms.value;
        /*for (let i = 0; i < this.rooms.value.length; i++) {
            if (rooms[i].id == roomId) {
                rooms[i].userIds = [...rooms[i].userIds, user.id];
                this.rooms.next(rooms);
            }
        }*/
        if (this.currentRoom.value.id == roomId) {
            
            const currentRoom = this.currentRoom.value;
            currentRoom.userIds = [...currentRoom.userIds, user.id]
            this.currentRoom.next(currentRoom);
            console.log(this.currentRoom.value);
        }
    }
}